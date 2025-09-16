from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.contrib.auth import authenticate, logout
from .models import UsuarioPersonalizado
from .serializer import UsuarioPersonalizadoSerializer

# Vistas para autenticación y CRUD de usuarios

class AutenticacionUsuario(APIView):
    """
    POST /usuario/api/login/
    Autentica al usuario con correo electrónico y contraseña.

    Ejemplo de JSON:
    {
        "correo_electronico": "usuario@ejemplo.com",
        "password": "tu_contraseña"
    }
    """
    def post(self, request):
        correo_electronico = request.data.get('correo_electronico')
        password = request.data.get('password')
        print("Correo recibido:", correo_electronico)
        print("Contraseña recibida:", password)
        usuario = authenticate(request, username=correo_electronico, password=password)
        print("Usuario autenticado:", usuario)
        if usuario is not None:
            return Response({'mensaje': 'Autenticación exitosa'}, status=status.HTTP_200_OK)
        else:
            return Response({'mensaje': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

class UsuarioListaCrear(generics.ListCreateAPIView):
    """
    GET /api/usuarios/
    Lista todos los usuarios.

    POST /api/usuarios/
    Crea un nuevo usuario.

    Ejemplo de JSON para POST:
    {
        "nombre": "Juan",
        "apellido": "Pérez",
        "correo_electronico": "juan.perez@ejemplo.com",
        "fecha_nacimiento": "1990-01-01",
        "telefono": "123456789",
        "password": "tu_contraseña"
    }
    """
    queryset = UsuarioPersonalizado.objects.all()
    serializer_class = UsuarioPersonalizadoSerializer

class UsuarioDetalleActualizarEliminar(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /usuario/api/usuarios/<id>/
    Obtiene los datos de un usuario.

    PUT /usuario/api/usuarios/<id>/
    Actualiza los datos de un usuario.

    Ejemplo de JSON para PUT:
    {
        "nombre": "Juan",
        "apellido": "Pérez",
        "correo_electronico": "juan.perez@ejemplo.com",
        "fecha_nacimiento": "1990-01-01",
        "telefono": "987654321"
    }

    DELETE api/usuarios/<id>/
    Elimina un usuario.
    """
    queryset = UsuarioPersonalizado.objects.all()
    serializer_class = UsuarioPersonalizadoSerializer

class CerrarSesionUsuario(APIView):
    """
    POST /api/logout/
    Cierra la sesión del usuario autenticado.
    """
    def post(self, request):
        logout(request)
        return Response({'mensaje': 'Sesión cerrada correctamente'}, status=status.HTTP_200_OK)

