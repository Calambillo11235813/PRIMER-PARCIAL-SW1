from django.db import models
from usuario.models import UsuarioPersonalizado  # Importa el modelo de usuario

class Proyecto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    creador = models.ForeignKey(UsuarioPersonalizado, on_delete=models.SET_NULL, null=True, blank=True, related_name='proyectos')  # Hacer opcional
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

class DiagramaClase(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='diagramas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    # Puedes agregar un campo para almacenar la estructura del diagrama (ejemplo: JSON)
    estructura = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.nombre
