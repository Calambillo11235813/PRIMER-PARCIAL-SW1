from django.db import models
from django.conf import settings
from django.utils import timezone
import secrets

class Proyecto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    # usar la referencia por string/settings para evitar import directo
    creador = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='proyectos_creados'
    )
    
    # NUEVO: Campo para colaboradores del proyecto
    colaboradores = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='proyectos_colaborando',
        blank=True
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"
        ordering = ['-fecha_actualizacion']

    def __str__(self):
        return self.nombre

    # NUEVO: Método para verificar si un usuario tiene acceso al proyecto
    def usuario_tiene_acceso(self, usuario):
        """
        Verifica si un usuario tiene acceso al proyecto.
        
        Args:
            usuario: Instancia de UsuarioPersonalizado
            
        Returns:
            bool: True si el usuario es creador o colaborador
        """
        if not usuario or not usuario.is_authenticated:
            return False
        
        # El creador siempre tiene acceso
        if self.creador and usuario == self.creador:
            return True
        
        # Verificar si es colaborador
        return self.colaboradores.filter(id=usuario.id).exists()

    # NUEVO: Método para obtener todos los usuarios con acceso
    def obtener_usuarios_con_acceso(self):
        """
        Retorna una lista de todos los usuarios con acceso al proyecto.
        
        Returns:
            QuerySet: Usuarios con acceso (creador + colaboradores)
        """
        usuarios = []
        if self.creador:
            usuarios.append(self.creador)
        
        colaboradores_list = list(self.colaboradores.all())
        usuarios.extend(colaboradores_list)
        
        # Eliminar duplicados (por si el creador también está en colaboradores)
        return list(set(usuarios))

    # NUEVO: Método para agregar colaborador
    def agregar_colaborador(self, usuario):
        """
        Agrega un usuario como colaborador del proyecto.
        
        Args:
            usuario: Instancia de UsuarioPersonalizado a agregar
            
        Returns:
            bool: True si se agregó exitosamente
        """
        if usuario and usuario.is_authenticated:
            self.colaboradores.add(usuario)
            return True
        return False

    # NUEVO: Método para remover colaborador
    def remover_colaborador(self, usuario):
        """
        Remueve un usuario de los colaboradores del proyecto.
        
        Args:
            usuario: Instancia de UsuarioPersonalizado a remover
            
        Returns:
            bool: True si se removió exitosamente
        """
        if usuario and self.colaboradores.filter(id=usuario.id).exists():
            self.colaboradores.remove(usuario)
            return True
        return False


class DiagramaClase(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    proyecto = models.ForeignKey(
        Proyecto, 
        on_delete=models.CASCADE, 
        related_name='diagramas'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    # Campo para almacenar la estructura del diagrama (ejemplo: JSON)
    estructura = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Diagrama de Clase"
        verbose_name_plural = "Diagramas de Clase"
        ordering = ['-fecha_actualizacion']

    def __str__(self):
        return self.nombre

    # NUEVO: Método para verificar acceso al diagrama
    def usuario_tiene_acceso(self, usuario):
        """
        Verifica si un usuario tiene acceso al diagrama a través del proyecto.
        
        Args:
            usuario: Instancia de UsuarioPersonalizado
            
        Returns:
            bool: True si el usuario tiene acceso al proyecto padre
        """
        return self.proyecto.usuario_tiene_acceso(usuario)

# NUEVO: Modelo Invitation para gestionar invitaciones a proyectos
class Invitation(models.Model):
    ESTADO_PENDIENTE = 'pendiente'
    ESTADO_ACEPTADA = 'aceptada'
    ESTADO_RECHAZADA = 'rechazada'
    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, 'Pendiente'),
        (ESTADO_ACEPTADA, 'Aceptada'),
        (ESTADO_RECHAZADA, 'Rechazada'),
    ]

    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='invitaciones')
    correo_electronico = models.EmailField()
    rol = models.CharField(max_length=30, default='colaborador')  # puede extenderse
    token = models.CharField(max_length=64, unique=True, editable=False)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default=ESTADO_PENDIENTE)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    creado_en = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('proyecto', 'correo_electronico')

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(24)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invitación {self.correo_electronico} -> {self.proyecto} ({self.estado})"

    def marcar_aceptada(self, usuario):
        """
        Marcar invitación como aceptada y añadir usuario al proyecto.
        """
        self.estado = self.ESTADO_ACEPTADA
        self.save()
        self.proyecto.colaboradores.add(usuario)
