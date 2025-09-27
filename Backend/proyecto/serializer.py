from rest_framework import serializers
from proyecto.models import Proyecto, DiagramaClase
from django.contrib.auth import get_user_model  # <-- Importa esto

User = get_user_model()  # <-- Obtén el modelo de usuario

class ProyectoSerializer(serializers.ModelSerializer):
    creador = serializers.StringRelatedField(read_only=True)
    
    # NUEVO: Campo para mostrar colaboradores
    colaboradores = serializers.StringRelatedField(
        many=True, 
        read_only=True,
        help_text="Lista de colaboradores del proyecto"
    )
    
    # NUEVO: Campo para enviar IDs de colaboradores al crear/actualizar
    colaboradores_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),  # <-- Usa el modelo real aquí
        source='colaboradores',
        many=True,
        required=False,
        write_only=True,
        help_text="IDs de usuarios a agregar como colaboradores"
    )

    class Meta:
        model = Proyecto
        fields = [
            'id', 
            'nombre', 
            'descripcion', 
            'creador', 
            'colaboradores',
            'colaboradores_ids',
            'fecha_creacion', 
            'fecha_actualizacion'
        ]
        read_only_fields = ['creador', 'colaboradores', 'fecha_creacion', 'fecha_actualizacion']

    def create(self, validated_data):
        """
        Crea un proyecto y asigna el creador automáticamente.
        """
        # Extraer colaboradores_ids si están presentes
        colaboradores_data = validated_data.pop('colaboradores', [])
        
        proyecto = Proyecto.objects.create(**validated_data)
        
        # Agregar colaboradores si se proporcionaron
        if colaboradores_data:
            proyecto.colaboradores.set(colaboradores_data)
        
        return proyecto

    def update(self, instance, validated_data):
        """
        Actualiza un proyecto y maneja colaboradores.
        """
        # Extraer colaboradores_ids si están presentes
        colaboradores_data = validated_data.pop('colaboradores', None)
        
        # Actualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar colaboradores si se proporcionaron
        if colaboradores_data is not None:
            instance.colaboradores.set(colaboradores_data)
        
        return instance


class DiagramaClaseSerializer(serializers.ModelSerializer):
    proyecto = serializers.PrimaryKeyRelatedField(queryset=Proyecto.objects.all())
    
    # NUEVO: Campo para verificar acceso del usuario actual
    usuario_tiene_acceso = serializers.SerializerMethodField(
        read_only=True,
        help_text="Indica si el usuario actual tiene acceso a este diagrama"
    )

    class Meta:
        model = DiagramaClase
        fields = [
            'id', 
            'nombre', 
            'descripcion', 
            'proyecto', 
            'estructura', 
            'fecha_creacion', 
            'fecha_actualizacion',
            'usuario_tiene_acceso'
        ]

    def get_usuario_tiene_acceso(self, obj):
        """
        Verifica si el usuario actual tiene acceso al diagrama.
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.usuario_tiene_acceso(request.user)
        return False