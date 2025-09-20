from rest_framework import serializers
from .models import Proyecto, DiagramaClase

class ProyectoSerializer(serializers.ModelSerializer):
    creador = serializers.StringRelatedField(read_only=True)  # Muestra el nombre del creador

    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'descripcion', 'creador', 'fecha_creacion', 'fecha_actualizacion']

class DiagramaClaseSerializer(serializers.ModelSerializer):
    # Permite enviar el ID del proyecto en POST/PUT, pero muestra el nombre en GET
    proyecto = serializers.PrimaryKeyRelatedField(queryset=Proyecto.objects.all())

    class Meta:
        model = DiagramaClase
        fields = ['id', 'nombre', 'descripcion', 'proyecto', 'estructura', 'fecha_creacion', 'fecha_actualizacion']