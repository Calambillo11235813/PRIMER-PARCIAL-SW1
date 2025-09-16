from rest_framework import serializers
from .models import UsuarioPersonalizado, Rol

class UsuarioPersonalizadoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)
    roles = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all(), many=True, required=False)

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
            'roles',
        ]
        read_only_fields = ('is_active', 'is_staff')  # Evitar que el cliente establezca estos campos

    def create(self, validated_data):
        roles_data = validated_data.pop('roles', [])
        password = validated_data.pop('password', None)
        correo_electronico = validated_data.get('correo_electronico')
        validated_data.pop('username', None)
        usuario = UsuarioPersonalizado(
            username=correo_electronico,
            **validated_data
        )
        if password:
            usuario.set_password(password)
        else:
            usuario.set_unusable_password()
        usuario.save()

        if not roles_data:
            anfitrion_rol, created = Rol.objects.get_or_create(nombre='Anfitrión')
            usuario.roles.add(anfitrion_rol)
        else:
            usuario.roles.set(roles_data)

        return usuario

    def update(self, instance, validated_data):
        # Manejar contraseña y roles de forma segura
        roles_data = validated_data.pop('roles', None)
        password = validated_data.pop('password', None)
        validated_data.pop('username', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        instance.save()

        if roles_data is not None:
            instance.roles.set(roles_data)

        return instance

    def validate(self, data):
        if not data.get('correo_electronico'):
            raise serializers.ValidationError("El correo electrónico es obligatorio.")
        # Agregar username internamente para compatibilidad con AbstractUser
        data['username'] = data['correo_electronico']
        return data