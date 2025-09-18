from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import UsuarioPersonalizado
from .serializer import UsuarioPersonalizadoSerializer
from rest_framework.decorators import api_view, permission_classes
import logging

logger = logging.getLogger(__name__)

# Elimina toda lógica de login/logout basada en sesión y CSRF

class UsuarioListaCrear(generics.ListCreateAPIView):
    """
    Listado y creación de usuarios.
    POST /api/usuarios/  -> crea usuario (no se registra la contraseña en logs).
    """
    queryset = UsuarioPersonalizado.objects.all()
    serializer_class = UsuarioPersonalizadoSerializer
    permission_classes = [AllowAny]  # Permite acceso sin autenticación

    def post(self, request, *args, **kwargs):
        safe_data = request.data.copy()
        safe_data.pop('password', None)
        logger.info("UsuarioListaCrear: datos recibidos (sin password): %s", {k: v for k, v in safe_data.items() if k != 'password'})
        return super().post(request, *args, **kwargs)


class UsuarioDetalleActualizarEliminar(generics.RetrieveUpdateDestroyAPIView):
    """
    Recuperar, actualizar o eliminar un usuario por PK.
    """
    queryset = UsuarioPersonalizado.objects.all()
    serializer_class = UsuarioPersonalizadoSerializer
    permission_classes = [AllowAny]  # Permite acceso sin autenticación


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_me(request):
    """
    Devuelve los datos del usuario autenticado.
    GET /api/me/
    """
    serializer = UsuarioPersonalizadoSerializer(request.user)
    return Response(serializer.data)

