from django.db import models

# Create your models here.

from django.db import models
from django.conf import settings
from proyecto.models import DiagramaClase

class SesionColaborativa(models.Model):
    """
    Representa una sesión de colaboración en tiempo real para un diagrama.
    """
    diagrama = models.OneToOneField(
        DiagramaClase,
        on_delete=models.CASCADE,
        related_name='sesion_colaborativa'
    )
    usuarios_conectados = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='ConexionUsuario',
        related_name='sesiones_activas'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activa = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Sesión Colaborativa"
        verbose_name_plural = "Sesiones Colaborativas"

    def __str__(self):
        return f"Sesión colaborativa - {self.diagrama.nombre}"

class ConexionUsuario(models.Model):
    """
    Registra la conexión de un usuario a una sesión colaborativa.
    """
    sesion = models.ForeignKey(SesionColaborativa, on_delete=models.CASCADE)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    canal_id = models.CharField(max_length=255)  # ID del canal WebSocket
    fecha_conexion = models.DateTimeField(auto_now_add=True)
    fecha_ultima_actividad = models.DateTimeField(auto_now=True)
    desconectado = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Conexión de Usuario"
        verbose_name_plural = "Conexiones de Usuario"
        unique_together = ['sesion', 'usuario']

    def __str__(self):
        return f"{self.usuario} en {self.sesion}"

class CambioDiagrama(models.Model):
    """
    Registra cambios realizados en un diagrama durante la colaboración.
    """
    TIPOS_CAMBIO = [
        ('crear_nodo', 'Crear Nodo'),
        ('actualizar_nodo', 'Actualizar Nodo'),
        ('eliminar_nodo', 'Eliminar Nodo'),
        ('crear_relacion', 'Crear Relación'),
        ('actualizar_relacion', 'Actualizar Relación'),
        ('eliminar_relacion', 'Eliminar Relación'),
    ]

    sesion = models.ForeignKey(SesionColaborativa, on_delete=models.CASCADE)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tipo_cambio = models.CharField(max_length=20, choices=TIPOS_CAMBIO)
    datos_cambio = models.JSONField()  # Datos específicos del cambio
    timestamp = models.DateTimeField(auto_now_add=True)
    sincronizado = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Cambio de Diagrama"
        verbose_name_plural = "Cambios de Diagrama"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.usuario} - {self.tipo_cambio} - {self.timestamp}"