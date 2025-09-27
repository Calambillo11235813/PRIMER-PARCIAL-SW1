from django.shortcuts import render
from rest_framework import generics
from .models import Proyecto, DiagramaClase
from .serializer import ProyectoSerializer, DiagramaClaseSerializer
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
import logging
from rest_framework.permissions import AllowAny, IsAuthenticated

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
