from rest_framework import serializers
from .models import UsuarioPersonalizado

class UsuarioPersonalizadoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = UsuarioPersonalizado
        fields = [
            'id',
            'nombre',
            'apellido',
            'correo_electronico',
            'fecha_nacimiento',
            'telefono',
            'is_active',
            'is_staff',
            'password',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = UsuarioPersonalizado(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario