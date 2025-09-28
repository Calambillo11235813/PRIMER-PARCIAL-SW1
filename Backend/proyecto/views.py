from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status
from .models import Proyecto, DiagramaClase, Invitation
from .serializer import ProyectoSerializer, DiagramaClaseSerializer, InvitationSerializer
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model 

User = get_user_model()

import logging

# Añadidos para notificaciones Channels
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

# Añadido para manejo de IntegrityError
from django.db import IntegrityError

logger = logging.getLogger(__name__)

class ProyectoListaCrear(generics.ListCreateAPIView):
    """
    GET /proyectos/
    - Si el usuario está autenticado: devuelve proyectos propios o compartidos.
    - Si no está autenticado: devuelve solo proyectos públicos (si existe campo public).
    """
    serializer_class = ProyectoSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        # log de entrada para debug
        auth = request.META.get('HTTP_AUTHORIZATION')
        auth_short = None
        if auth:
            auth_short = auth if len(auth) <= 80 else f"{auth[:40]}...{auth[-20:]}"
        logger.debug(
            "ProyectoListaCrear.list called path=%s method=%s remote=%s auth=%s user=%s is_authenticated=%s query=%s",
            request.path,
            request.method,
            request.META.get('REMOTE_ADDR'),
            auth_short,
            getattr(request.user, 'username', getattr(request.user, 'id', None)),
            getattr(request.user, 'is_authenticated', False),
            request.GET.dict()
        )
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        user = getattr(self.request, 'user', None)
        is_auth = getattr(user, 'is_authenticated', False)
        logger.debug("ProyectoListaCrear.get_queryset - user=%s is_authenticated=%s", getattr(user, 'id', None), is_auth)

        if is_auth:
            qs = Proyecto.objects.filter(Q(creador=user) | Q(colaboradores=user)).distinct()
            logger.debug("ProyectoListaCrear.get_queryset returning filtered proyectos count=%s", qs.count())
            return qs

        # No autenticado: devolver solo proyectos públicos si existe campo 'public'
        if hasattr(Proyecto, 'public'):
            qs_public = Proyecto.objects.filter(public=True)
            logger.debug("ProyectoListaCrear.get_queryset returning public proyectos count=%s", qs_public.count())
            return qs_public

        logger.debug("ProyectoListaCrear.get_queryset returning none (no auth, no public field)")
        return Proyecto.objects.none()

    def perform_create(self, serializer):
        logger.debug("ProyectoListaCrear.perform_create called by user=%s", getattr(self.request.user, 'id', None))
        if getattr(self.request.user, 'is_authenticated', False):
            serializer.save(creador=self.request.user)
        else:
            serializer.save()

class ProyectoDetalleActualizarEliminar(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /proyectos/<id>/
    Obtiene los detalles de un proyecto específico.

    PUT /proyectos/<id>/
    Actualiza los datos de un proyecto.

    Ejemplo de JSON para PUT:
    {
        "nombre": "Proyecto UML Actualizado",
        "descripcion": "Descripción actualizada del proyecto"
    }

    DELETE /proyectos/<id>/
    Elimina un proyecto.
    """
    serializer_class = ProyectoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        logger.debug("ProyectoDetalle: peticionado por user=%s (is_authenticated=%s)", getattr(user, 'id', user), getattr(user, 'is_authenticated', False))
        return Proyecto.objects.filter(Q(creador=user) | Q(colaboradores=user)).distinct()

    def perform_update(self, serializer):
        serializer.save()

class DiagramaClaseListaCrear(generics.ListCreateAPIView):
    """
    GET /diagramas/
    Lista todos los diagramas de clases.

    POST /diagramas/
    Crea un nuevo diagrama de clases.

    Ejemplo de JSON para POST:
    {
        "nombre": "Diagrama de Ventas",
        "descripcion": "Diagrama de clases para el módulo de ventas",
        "proyecto": 1,
        "estructura": {
            "clases": [
                {"nombre": "Producto", "atributos": ["id", "nombre", "precio"]},
                {"nombre": "Venta", "atributos": ["id", "fecha", "total"]}
            ],
            "relaciones": [
                {"origen": "Venta", "destino": "Producto", "tipo": "asociación"}
            ]
        }
    }
    """
    serializer_class = DiagramaClaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        logger.debug("DiagramaClaseListaCrear: peticionado por user=%s (is_authenticated=%s)", getattr(user, 'id', user), getattr(user, 'is_authenticated', False))
        return DiagramaClase.objects.filter(Q(proyecto__creador=user) | Q(proyecto__colaboradores=user)).distinct()

class DiagramaClaseDetalleActualizarEliminar(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /diagramas/<id>/
    Obtiene los detalles de un diagrama de clases.

    PUT /diagramas/<id>/
    Actualiza los datos de un diagrama de clases.

    Ejemplo de JSON para PUT:
    {
        "nombre": "Diagrama de Ventas Actualizado",
        "descripcion": "Actualización del diagrama de clases para ventas",
        "proyecto":4,
        "estructura": {
            "clases": [
                {"nombre": "Producto", "atributos": ["id", "nombre", "precio", "stock"]},
                {"nombre": "Venta", "atributos": ["id", "fecha", "total", "cliente"]}
            ],
            "relaciones": [
                {"origen": "Venta", "destino": "Producto", "tipo": "asociación"}
            ]
        }
    }

    DELETE /diagramas/<id>/
    Elimina un diagrama de clases.
    """
    serializer_class = DiagramaClaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        logger.debug("DiagramaClaseDetalle: peticionado por user=%s (is_authenticated=%s)", getattr(user, 'id', user), getattr(user, 'is_authenticated', False))
        return DiagramaClase.objects.filter(Q(proyecto__creador=user) | Q(proyecto__colaboradores=user)).distinct()

    # NUEVO: tratar PUT como actualización parcial para permitir enviar solo "estructura"
    def put(self, request, *args, **kwargs):
        """
        Permitimos que PUT actúe como partial_update para que el cliente pueda enviar
        únicamente el campo 'estructura' (clases/relaciones) sin que fallen las validaciones
        de campos obligatorios que no se estén modificando.
        """
        return self.partial_update(request, *args, **kwargs)

class ProyectosPorUsuario(generics.ListAPIView):
    """
    GET /api/proyectos/usuario/<usuario_id>/
    Devuelve los proyectos cuyo campo 'creador' coincide con el usuario indicado.
    NO requiere autenticación (por simplicidad). Considerar cambiar a IsAuthenticated.
    """
    serializer_class = ProyectoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        usuario_id = self.kwargs.get('usuario_id')
        logger.debug("ProyectosPorUsuario.get_queryset usuario_id=%s", usuario_id)
        if not usuario_id:
            return Proyecto.objects.none()
        return Proyecto.objects.filter(creador__id=usuario_id).distinct()

# NUEVA: Vista para crear invitaciones en un proyecto
class InvitacionCrearAPIView(generics.CreateAPIView):
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_proyecto(self):
        proyecto_id = self.kwargs.get('pk')
        proyecto = get_object_or_404(Proyecto, pk=proyecto_id)
        return proyecto

    def post(self, request, *args, **kwargs):
        proyecto = self.get_proyecto()

        # Solo el creador del proyecto puede enviar invitaciones (ajustable)
        if proyecto.creador != request.user:
            return Response({'detail': 'No tiene permiso para invitar colaboradores.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data['proyecto'] = proyecto.id
        serializer = self.get_serializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            invitacion = serializer.save()
        except IntegrityError:
            return Response({'detail': 'Invitación ya existente o conflicto.'}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            logger.exception("Error creando invitación: %s", e)
            return Response({'detail': 'Error interno al crear invitación.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Notificar via Channels si está configurado
        try:
            channel_layer = get_channel_layer()
            if channel_layer is not None:
                payload = {
                    'type': 'notificacion.invitacion',
                    'evento': 'invitacion_creada',
                    'proyecto_id': proyecto.id,
                    'proyecto_nombre': str(proyecto),
                    'correo_invitado': invitacion.correo_electronico,
                    'invitacion_id': invitacion.id,
                    'mensaje': f'Se ha enviado una invitación a {invitacion.correo_electronico}'
                }
                async_to_sync(channel_layer.group_send)(f'proyecto_{proyecto.id}', payload)

                # Si el usuario ya existe, notificar al grupo personal del usuario
                try:
                    Usuario = get_user_model()
                    email_field = getattr(Usuario, 'EMAIL_FIELD', 'correo_electronico')
                    lookup = {f"{email_field}__iexact": invitacion.correo_electronico}
                    usuario_dest = Usuario.objects.filter(**lookup).first()
                    if usuario_dest:
                        async_to_sync(channel_layer.group_send)(f'user_{usuario_dest.id}', payload)
                except Exception:
                    logger.exception('Error notificando al usuario por email en invitación')

        except Exception as e:
            logger.exception('Error notificando por Channels al crear invitación: %s', e)

        return Response(InvitationSerializer(invitacion).data, status=status.HTTP_201_CREATED)

def _get_user_email_normalized(user):
    """
    Obtener identificador de usuario normalizado (usa USERNAME_FIELD vía get_username()
    y cae en atributos comunes si es necesario). Devuelve '' si no se encuentra.
    """
    if user is None:
        return ''
    # Primer intento: get_username() (es fiable para USERNAME_FIELD = 'correo_electronico')
    try:
        val = user.get_username()
        if val:
            return str(val).strip().lower()
    except Exception:
        pass

    # Fallback a campos comunes
    candidates = ['correo_electronico', 'email']
    for field in candidates:
        try:
            val = getattr(user, field, None)
        except Exception:
            val = None
        if val:
            return str(val).strip().lower()
    return ''

class InvitacionAceptarAPIView(APIView):
    """
    Aceptar una invitación usando su token.
    POST { "token": "<token_invitacion>" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        if not token:
            return Response({'detail': 'Token de invitación requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invitacion = Invitation.objects.select_related('proyecto').get(token=token)
        except Invitation.DoesNotExist:
            return Response({'detail': 'Invitación no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        invitacion_email = (invitacion.correo_electronico or '').strip().lower()
        user_email_value = _get_user_email_normalized(request.user)

        if invitacion_email != user_email_value:
            return Response({'detail': 'El token no corresponde al usuario autenticado.'}, status=status.HTTP_403_FORBIDDEN)

        invitacion.marcar_aceptada(request.user)

        # Notificar via Channels (si está configurado)
        try:
            channel_layer = get_channel_layer()
            if channel_layer is not None:
                payload = {
                    'type': 'notificacion.invitacion',
                    'evento': 'invitacion_aceptada',
                    'proyecto_id': invitacion.proyecto.id,
                    'proyecto_nombre': str(invitacion.proyecto),
                    'usuario_id': request.user.id,
                    'usuario_nombre': str(request.user),
                    'mensaje': f'{request.user} aceptó la invitación al proyecto.'
                }
                async_to_sync(channel_layer.group_send)(f'proyecto_{invitacion.proyecto.id}', payload)
                async_to_sync(channel_layer.group_send)(f'user_{request.user.id}', payload)
        except Exception as e:
            logger.exception('Error notificando por Channels: %s', e)

        return Response({'detail': 'Invitación aceptada.', 'proyecto_id': invitacion.proyecto.id}, status=status.HTTP_200_OK)
