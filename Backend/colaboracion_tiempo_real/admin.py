from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import SesionColaborativa, ConexionUsuario, CambioDiagrama

@admin.register(SesionColaborativa)
class SesionColaborativaAdmin(admin.ModelAdmin):
    list_display = ['id', 'diagrama', 'activa', 'fecha_creacion']
    list_filter = ['activa', 'fecha_creacion']
    search_fields = ['diagrama__nombre']

@admin.register(ConexionUsuario)
class ConexionUsuarioAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'sesion', 'fecha_conexion', 'desconectado']
    list_filter = ['desconectado', 'fecha_conexion']
    search_fields = ['usuario__nombre', 'sesion__diagrama__nombre']

@admin.register(CambioDiagrama)
class CambioDiagramaAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'tipo_cambio', 'timestamp', 'sincronizado']
    list_filter = ['tipo_cambio', 'sincronizado', 'timestamp']
    search_fields = ['usuario__nombre', 'sesion__diagrama__nombre']