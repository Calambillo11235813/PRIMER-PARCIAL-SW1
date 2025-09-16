from rest_framework import serializers
from .models import Proyecto

class ProyectoSerializer(serializers.ModelSerializer):
    creador = serializers.StringRelatedField(read_only=True)  # Muestra el nombre del creador

    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'descripcion', 'creador', 'fecha_creacion', 'fecha_actualizacion']