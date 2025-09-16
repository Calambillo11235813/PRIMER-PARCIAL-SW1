from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.contrib.auth import authenticate, logout, login
from .models import UsuarioPersonalizado
from .serializer import UsuarioPersonalizadoSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

decorador_login = method_decorator(csrf_exempt, name='dispatch') if settings.DEBUG else (lambda x: x)

@decorador_login
class AutenticacionUsuario(APIView):
    """
    Endpoint para autenticación por correo y contraseña.
    POST /api/login/
    Payload: { "correo_electronico": "...", "password": "..." }
    En DEBUG aplica csrf_exempt (solo para desarrollo).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        correo_electronico = request.data.get('correo_electronico')
        password = request.data.get('password')
        if not correo_electronico or not password:
            return Response({'errors': 'Correo y contraseña requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        usuario = authenticate(request, username=correo_electronico, password=password)
        if usuario is None:
            logger.info("Intento de autenticación fallido para: %s", correo_electronico)
            return Response({'errors': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

        if not usuario.is_active:
            logger.warning("Cuenta desactivada intentó iniciar sesión: %s", correo_electronico)
            return Response({'errors': 'Cuenta desactivada'}, status=status.HTTP_403_FORBIDDEN)

        login(request, usuario)
        serializer = UsuarioPersonalizadoSerializer(usuario)
        logger.info("Autenticación exitosa para: %s", correo_electronico)
        return Response({'mensaje': 'Autenticación exitosa', 'usuario': serializer.data}, status=status.HTTP_200_OK)


class UsuarioListaCrear(generics.ListCreateAPIView):
    """
    Listado y creación de usuarios.
    POST /api/usuarios/  -> crea usuario (no se registra la contraseña en logs).
    """
    queryset = UsuarioPersonalizado.objects.all()
    serializer_class = UsuarioPersonalizadoSerializer

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


class CerrarSesionUsuario(APIView):
    """
    Cierra la sesión del usuario actual.
    POST /api/logout/
    En DEBUG permite cualquier origen para facilitar pruebas; en producción requiere autenticación.
    """
    # permisos condicionales: en desarrollo AllowAny para facilitar pruebas; en producción requiere IsAuthenticated
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]

    def post(self, request):
        if request.user.is_authenticated:
            usuario_email = getattr(request.user, 'correo_electronico', None)
            logout(request)
            logger.info("Sesión cerrada para: %s", usuario_email)
        else:
            logger.info("Solicitud de logout sin usuario autenticado")
        return Response({'mensaje': 'Sesión cerrada correctamente'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_me(request):
    """
    Devuelve los datos del usuario autenticado.
    GET /api/me/
    """
    serializer = UsuarioPersonalizadoSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def establecer_csrf(request):
    """Establece la cookie 'csrftoken'. Llamar desde el frontend antes de POST mutativos."""
    return Response({'detail': 'CSRF cookie establecida'}, status=200)

