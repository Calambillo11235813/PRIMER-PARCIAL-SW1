from rest_framework import serializers
from .models import SesionColaborativa, ConexionUsuario, CambioDiagrama

class SesionColaborativaSerializer(serializers.ModelSerializer):
    """
    Serializer para sesiones colaborativas.
    """
    diagrama_nombre = serializers.CharField(source='diagrama.nombre', read_only=True)
    usuarios_conectados = serializers.SerializerMethodField()

    class Meta:
        model = SesionColaborativa
        fields = [
            'id', 
            'diagrama', 
            'diagrama_nombre',
            'usuarios_conectados',
            'fecha_creacion', 
            'activa'
        ]
        read_only_fields = ['fecha_creacion', 'activa']

    def get_usuarios_conectados(self, obj):
        """
        Obtiene la lista de usuarios conectados a la sesión.
        """
        conexiones_activas = obj.conexionusuario_set.filter(desconectado=False)
        return [
            {
                'id': conexion.usuario.id,
                'nombre': f"{conexion.usuario.nombre} {conexion.usuario.apellido}",
                'correo': conexion.usuario.correo_electronico,
                'fecha_conexion': conexion.fecha_conexion
            }
            for conexion in conexiones_activas
        ]

class CambioDiagramaSerializer(serializers.ModelSerializer):
    """
    Serializer para cambios en diagramas.
    """
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)

    class Meta:
        model = CambioDiagrama
        fields = [
            'id',
            'sesion',
            'usuario',
            'usuario_nombre',
            'tipo_cambio',
            'datos_cambio',
            'timestamp',
            'sincronizado'
        ]
        read_only_fields = ['timestamp', 'sincronizado']