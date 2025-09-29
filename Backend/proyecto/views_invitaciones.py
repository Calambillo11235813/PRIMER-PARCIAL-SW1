from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Proyecto, Invitation
from .serializer import InvitationSerializer

logger = logging.getLogger(__name__)

def _get_user_email_normalized(user):
    """
    Obtener email normalizado del usuario (usa get_username o campos comunes).
    """
    if user is None:
        return ''
    try:
        val = user.get_username()
        if val:
            return str(val).strip().lower()
    except Exception:
        pass
    for field in ('correo_electronico', 'email'):
        val = getattr(user, field, None)
        if val:
            return str(val).strip().lower()
    return ''

class InvitacionCrearAPIView(generics.CreateAPIView):
    """
    POST /proyectos/<pk>/invitaciones/
    - Inyecta proyecto desde la URL; solo usuarios autorizados pueden invitar.
    """
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_proyecto(self):
        proyecto_id = self.kwargs.get('pk')
        return get_object_or_404(Proyecto, pk=proyecto_id)

    def post(self, request, *args, **kwargs):
        proyecto = self.get_proyecto()
        # política de permisos: solo creador puede invitar (ajustable)
        if proyecto.creador != request.user:
            return Response({'detail': 'No tiene permiso para invitar colaboradores.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data['proyecto'] = proyecto.id
        serializer = self.get_serializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        invitacion = serializer.save()

        # notificar por Channels si está disponible
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
                async_to_sync(channel_layer.group_send)(f'proyecto_{proyecto.id}', payload)
        except Exception:
            logger.exception('Error notificando por Channels al crear invitación')

        return Response(InvitationSerializer(invitacion).data, status=status.HTTP_201_CREATED)

class InvitacionListCreateAPIView(generics.ListCreateAPIView):
    """
    GET /proyectos/<pk>/invitaciones/  -> listar
    POST /proyectos/<pk>/invitaciones/ -> crear (delegado a InvitacionCrearAPIView o aquí)
    """
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        proyecto_id = self.kwargs.get('pk')
        return Invitation.objects.filter(proyecto_id=proyecto_id).order_by('-id')

    def perform_create(self, serializer):
        proyecto = get_object_or_404(Proyecto, pk=self.kwargs.get('pk'))
        serializer.save(proyecto=proyecto, creado_por=self.request.user)

class InvitacionAceptarAPIView(APIView):
    """
    POST /invitaciones/aceptar/  { "token": "<token>" }
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

        # notificar por Channels
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                payload = {
                    'type': 'notificacion.invitacion',
                    'evento': 'invitacion_aceptada',
                    'proyecto_id': invitacion.proyecto.id,
                    'usuario_id': request.user.id,
                }
                async_to_sync(channel_layer.group_send)(f'proyecto_{invitacion.proyecto.id}', payload)
        except Exception:
            logger.exception('Error notificando por Channels: %s', exc_info=True)

        return Response({'detail': 'Invitación aceptada.', 'proyecto_id': invitacion.proyecto.id}, status=status.HTTP_200_OK)