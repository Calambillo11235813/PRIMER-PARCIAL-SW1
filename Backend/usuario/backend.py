from django.contrib.auth.backends import ModelBackend
from .models import UsuarioPersonalizado

class AutenticacionPorCorreoBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            usuario = UsuarioPersonalizado.objects.get(correo_electronico=username)
            if usuario.check_password(password):
                return usuario
        except UsuarioPersonalizado.DoesNotExist:
            return None