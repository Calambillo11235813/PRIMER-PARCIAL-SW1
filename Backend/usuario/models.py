from django.contrib.auth.models import AbstractUser
from django.db import models

class Rol(models.Model):
    nombre = models.CharField(max_length=50, unique=True)  # e.g., 'Anfitrión', 'Colaborador'
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

class UsuarioPersonalizado(AbstractUser):
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    correo_electronico = models.EmailField(unique=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    roles = models.ManyToManyField(Rol, blank=True)  # Relación muchos a muchos para múltiples roles

    USERNAME_FIELD = 'correo_electronico'
    REQUIRED_FIELDS = ['nombre', 'apellido']

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
