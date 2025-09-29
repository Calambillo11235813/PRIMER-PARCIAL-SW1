from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied

from .models import Proyecto, DiagramaClase, Invitation
from .serializer import ProyectoSerializer, DiagramaClaseSerializer
from usuario.serializer import UsuarioPersonalizadoSerializer
import logging
logger = logging.getLogger(__name__)

class ProyectoListaCrear(generics.ListCreateAPIView):
    """
    GET /proyectos/ -> lista (filtrada por creador/colaborador si auth)
    POST /proyectos/ -> crea proyecto (si user auth, lo marca como creador)
    """
    serializer_class = ProyectoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = getattr(self.request, 'user', None)
        if getattr(user, 'is_authenticated', False):
            return Proyecto.objects.filter(Q(creador=user) | Q(colaboradores=user)).distinct()
        if hasattr(Proyecto, 'public'):
            return Proyecto.objects.filter(public=True)
        return Proyecto.objects.none()

    def perform_create(self, serializer):
        if getattr(self.request.user, 'is_authenticated', False):
            serializer.save(creador=self.request.user)
        else:
            serializer.save()

class ProyectoDetalleActualizarEliminar(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/DELETE para un proyecto (requiere autenticación).
    """
    serializer_class = ProyectoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Proyecto.objects.filter(Q(creador=user) | Q(colaboradores=user)).distinct()

    def perform_update(self, serializer):
        serializer.save()

    def retrieve(self, request, *args, **kwargs):
        """
        Override para añadir logging al recuperar un proyecto.
        """
        instancia = self.get_object()
        creador_id = getattr(instancia.creador, 'id', None)
        logger.debug("ProyectoDetalle: id=%s, creador_id=%s", instancia.pk, creador_id)
        serializer = self.get_serializer(instancia)
        return Response(serializer.data)

class ColaboradorEliminarAPIView(APIView):
    """
    DELETE /proyectos/<pk>/colaboradores/<user_id>/
    - Solo el creador del proyecto puede eliminar colaboradores.
    - Al eliminar, borra también las invitaciones asociadas al correo del usuario en ese proyecto.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, user_id, *args, **kwargs):
        proyecto = get_object_or_404(Proyecto, pk=pk)
        # permiso: solo creador puede eliminar colaboradores (ajustable)
        if proyecto.creador != request.user:
            return Response({'detail': 'No tiene permiso para eliminar colaboradores.'}, status=status.HTTP_403_FORBIDDEN)

        usuario = get_object_or_404(User, pk=user_id)
        if not proyecto.colaboradores.filter(pk=usuario.pk).exists():
            return Response({'detail': 'El usuario no es colaborador del proyecto.'}, status=status.HTTP_404_NOT_FOUND)

        # remover colaborador
        proyecto.colaboradores.remove(usuario)

        # eliminar invitaciones pendientes/registradas para ese correo en este proyecto
        try:
            email = usuario.get_username().strip().lower()
        except Exception:
            # fallback a atributos comunes
            email = getattr(usuario, 'correo_electronico', '') or getattr(usuario, 'email', '')
            email = str(email).strip().lower()

        Invitation.objects.filter(proyecto=proyecto, correo_electronico__iexact=email).delete()

        return Response({'detail': 'Colaborador eliminado y sus invitaciones asociadas borradas.'}, status=status.HTTP_200_OK)

class DiagramaClaseListaCrear(generics.ListCreateAPIView):
    serializer_class = DiagramaClaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return DiagramaClase.objects.filter(Q(proyecto__creador=user) | Q(proyecto__colaboradores=user)).distinct()

class DiagramaClaseDetalleActualizarEliminar(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DiagramaClaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return DiagramaClase.objects.filter(Q(proyecto__creador=user) | Q(proyecto__colaboradores=user)).distinct()

    def put(self, request, *args, **kwargs):
        # permitir partial update vía PUT para estructura
        return self.partial_update(request, *args, **kwargs)

class ColaboradoresListAPIView(generics.ListAPIView):
    """
    GET /proyectos/<pk>/colaboradores/
    - Devuelve la lista de colaboradores del proyecto.
    - Solo el creador del proyecto o los propios colaboradores pueden consultar la lista.
    """
    serializer_class = UsuarioPersonalizadoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        proyecto = get_object_or_404(Proyecto, pk=self.kwargs.get('pk'))
        user = self.request.user
        # permiso: solo creador o colaborador pueden ver la lista
        if not (proyecto.creador == user or proyecto.colaboradores.filter(pk=user.pk).exists()):
            raise PermissionDenied('No tiene permiso para ver los colaboradores de este proyecto.')
        return proyecto.colaboradores.all().order_by('id')

class ProyectosPorUsuario(generics.ListAPIView):
    """
    GET /proyectos/usuario/<usuario_id>/
    - Devuelve los proyectos donde el usuario es creador o colaborador.
    """
    serializer_class = ProyectoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        usuario_id = self.kwargs.get('usuario_id')
        logger.debug("ProyectosPorUsuario: solicitando proyectos para usuario_id=%s", usuario_id)
        if usuario_id is None:
            logger.debug("ProyectosPorUsuario: usuario_id es None -> retornar queryset vacío")
            return Proyecto.objects.none()
        qs = Proyecto.objects.filter(Q(creador_id=usuario_id) | Q(colaboradores__id=usuario_id)).distinct()
        logger.debug("ProyectosPorUsuario: encontrado count=%s ids=%s", qs.count(), list(qs.values_list('id', flat=True)))
        return qs