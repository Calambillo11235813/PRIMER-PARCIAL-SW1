from rest_framework import serializers
from proyecto.models import Proyecto, DiagramaClase, Invitation
from django.contrib.auth import get_user_model
from django.db import transaction, IntegrityError

User = get_user_model()

class ProyectoSerializer(serializers.ModelSerializer):
    creador = serializers.StringRelatedField(read_only=True)
    colaboradores_ids = serializers.PrimaryKeyRelatedField(
        source='colaboradores', many=True, queryset=User.objects.all(), required=False
    )

    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'descripcion', 'creador', 'colaboradores_ids']

    def create(self, validated_data):
        colaboradores = validated_data.pop('colaboradores', [])
        proyecto = Proyecto.objects.create(**validated_data)
        if colaboradores:
            proyecto.colaboradores.set(colaboradores)
        return proyecto

    def update(self, instance, validated_data):
        colaboradores = validated_data.pop('colaboradores', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if colaboradores is not None:
            instance.colaboradores.set(colaboradores)
        return instance

class DiagramaClaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagramaClase
        fields = '__all__'

# Serializer para Invitation
class InvitationSerializer(serializers.ModelSerializer):
    # campo explícito writeable para proyecto (PrimaryKey)
    proyecto = serializers.PrimaryKeyRelatedField(queryset=Proyecto.objects.all(), write_only=True)
    proyecto_id = serializers.IntegerField(source='proyecto.id', read_only=True)

    class Meta:
        model = Invitation
        fields = ['id', 'proyecto', 'proyecto_id', 'correo_electronico', 'rol', 'token', 'estado', 'creado_por', 'creado_en']
        read_only_fields = ['token', 'estado', 'creado_por', 'creado_en']

    def validate(self, attrs):
        proyecto = attrs.get('proyecto')
        correo = attrs.get('correo_electronico')
        # Validación explícita: correo requerido
        if not correo or (isinstance(correo, str) and not correo.strip()):
            raise serializers.ValidationError({'correo_electronico': 'Este campo es requerido.'})
        # evitar duplicados: si ya existe una invitación para ese par, devolver error de validación
        if Invitation.objects.filter(proyecto=proyecto, correo_electronico__iexact=correo).exists():
            raise serializers.ValidationError({'detail': 'Ya existe una invitación para ese correo en este proyecto.'})
        return super().validate(attrs)

    def create(self, validated_data):
        """
        Crear invitación: siempre dejarla en estado 'pendiente'.

        No añadir automáticamente al usuario aunque exista una cuenta con ese email.
        """
        request = self.context.get('request')
        proyecto = validated_data.get('proyecto')
        correo = (validated_data.get('correo_electronico') or '').strip().lower()
        rol = validated_data.get('rol', 'colaborador')

        try:
            with transaction.atomic():
                invitacion = Invitation.objects.create(
                    proyecto=proyecto,
                    correo_electronico=correo,
                    rol=rol,
                    creado_por=request.user if request else None,
                )
                return invitacion
        except IntegrityError:
            raise serializers.ValidationError(
                {'detail': 'Conflicto al crear la invitación (posible duplicado).'}
            )

    def to_internal_value(self, data):
        """
        Acepta alias comunes desde el frontend y normaliza el correo.
        - Permite que el frontend envíe "email" o "correo_electronico".
        - Normaliza correo: strip() y lower().
        """
        data = data.copy()
        # map alias 'email' -> 'correo_electronico' si aplica
        if 'email' in data and 'correo_electronico' not in data:
            data['correo_electronico'] = data.pop('email')

        # normalizar el campo de correo si está presente y es string
        if 'correo_electronico' in data and isinstance(data['correo_electronico'], str):
            data['correo_electronico'] = data['correo_electronico'].strip().lower()

        return super().to_internal_value(data)