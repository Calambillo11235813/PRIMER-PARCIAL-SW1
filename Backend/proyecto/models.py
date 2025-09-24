from django.db import models
from django.conf import settings

class Proyecto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    # usar la referencia por string/settings para evitar import directo
    creador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='proyectos')
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
