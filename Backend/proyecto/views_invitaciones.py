import logging

from django.shortcuts import get_object_or_404

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Proyecto, Invitation
from .serializer import InvitationSerializer

logger = logging.getLogger(__name__)


def _get_user_email_normalized(user):
    """
    Obtener email normalizado del usuario.

    Intenta user.get_username(), y como fallback busca atributos
    comunes ('correo_electronico', 'email').
    """
    if user is None:
        return ''

    try:
        username = user.get_username()
        if username:
            return str(username).strip().lower()
    except Exception:
        pass

    for campo in ('correo_electronico', 'email'):
        val = getattr(user, campo, None)
        if val:
            return str(val).strip().lower()

    return ''


class InvitacionCrearAPIView(generics.ListCreateAPIView):
    """
    GET  /proyectos/<pk>/invitaciones/  -> listar invitaciones del proyecto
    POST /proyectos/<pk>/invitaciones/  -> crear invitación (solo creador)
    """
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_proyecto(self):
        proyecto_id = self.kwargs.get('pk')
        return get_object_or_404(Proyecto, pk=proyecto_id)

    def get_queryset(self):
        proyecto_id = self.kwargs.get('pk')
        return Invitation.objects.filter(proyecto_id=proyecto_id).order_by('-id')

    def create(self, request, *args, **kwargs):
        proyecto = self.get_proyecto()
        if proyecto.creador != request.user:
            return Response({'detail': 'No tiene permiso para invitar colaboradores.'},
                            status=status.HTTP_403_FORBIDDEN)

        datos = request.data.copy()
        datos['proyecto'] = proyecto.id
        serializer = self.get_serializer(data=datos, context={'request': request})
        serializer.is_valid(raise_exception=True)
        invitacion = serializer.save()
        invitacion.estado = 'pendiente'
        invitacion.save(update_fields=['estado'])

        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                payload = {
                    'type': 'notificacion.invitacion',
                    'evento': 'invitacion_creada',
                    'proyecto_id': proyecto.id,
                    'correo_invitado': invitacion.correo_electronico,
                    'invitacion_id': invitacion.id,
                }
                async_to_sync(channel_layer.group_send)(
                    f'proyecto_{proyecto.id}', payload
                )
        except Exception:
            logger.exception('Error notificando por Channels al crear invitación')

        headers = self.get_success_headers(serializer.data)
        return Response(InvitationSerializer(invitacion).data, status=status.HTTP_201_CREATED, headers=headers)




class InvitacionAceptarAPIView(APIView):
    """
    POST /invitaciones/aceptar/
    - Body JSON de ejemplo:
      { "token": "OZOU5ouSHIBbxj55e7_WUphy3tuyxPkl" }

    - Respuesta (200 OK) de ejemplo:
      { "detail": "Invitación aceptada.", "proyecto_id": 1 }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        if not token:
            return Response(
                {'detail': 'Token de invitación requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            invitacion = Invitation.objects.select_related('proyecto').get(token=token)
        except Invitation.DoesNotExist:
            return Response(
                {'detail': 'Invitación no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        invitacion_email = (invitacion.correo_electronico or '').strip().lower()
        user_email = _get_user_email_normalized(request.user)

        if invitacion_email != user_email:
            return Response(
                {'detail': 'El token no corresponde al usuario autenticado.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # marcar aceptada en el modelo (metodo del modelo)
        invitacion.marcar_aceptada(request.user)

        # Notificar por Channels
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                payload = {
                    'type': 'notificacion.invitacion',
                    'evento': 'invitacion_aceptada',
                    'proyecto_id': invitacion.proyecto.id,
                    'usuario_id': request.user.id,
                }
                async_to_sync(channel_layer.group_send)(
                    f'proyecto_{invitacion.proyecto.id}', payload
                )
        except Exception:
            logger.exception('Error notificando por Channels: %s', exc_info=True)

        return Response(
            {'detail': 'Invitación aceptada.', 'proyecto_id': invitacion.proyecto.id},
            status=status.HTTP_200_OK,
        )


class InvitacionesPorUsuarioProyectoAPIView(generics.ListAPIView):
    """
    GET /proyectos/<pk>/invitaciones/usuario/<usuario_id>/
    Lista invitaciones del proyecto creadas por usuario_id.
    """
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        proyecto = get_object_or_404(Proyecto, pk=self.kwargs.get('pk'))
        return Invitation.objects.filter(
            proyecto=proyecto, creado_por_id=self.kwargs.get('usuario_id')
        ).order_by('-id')


class InvitacionListAPIView(generics.ListAPIView):
    """
    GET  /proyectos/<pk>/invitaciones/listar/
    Devuelve las invitaciones del proyecto (solo lectura).
    """
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        proyecto_id = self.kwargs.get('pk')
        return Invitation.objects.filter(proyecto_id=proyecto_id).order_by('-id')