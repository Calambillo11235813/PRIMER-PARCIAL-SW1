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
        # evitar duplicados: si ya existe una invitación para ese par, devolver error de validación
        if Invitation.objects.filter(proyecto=proyecto, correo_electronico__iexact=correo).exists():
            raise serializers.ValidationError({'detail': 'Ya existe una invitación para ese correo en este proyecto.'})
        return super().validate(attrs)

    def create(self, validated_data):
        request = self.context.get('request')
        proyecto = validated_data.get('proyecto')
        correo = validated_data.get('correo_electronico') or ''
        # normalizar correo para comparaciones/almacenamiento
        correo = correo.strip().lower()
        rol = validated_data.get('rol', 'colaborador')

        # localizar usuario existente probando varios nombres de campo de email
        usuario_obj = None
        email_field_names = []
        # añadir USER.EMAIL_FIELD si existe
        if getattr(User, 'EMAIL_FIELD', None):
            email_field_names.append(User.EMAIL_FIELD)
        # nombres comunes
        email_field_names += ['email', 'correo_electronico']
        # evitar duplicados
        seen = set()
        email_field_names = [f for f in email_field_names if not (f in seen or seen.add(f))]

        for field in email_field_names:
            try:
                lookup = {f"{field}__iexact": correo}
                usuario_obj = User.objects.get(**lookup)
                break
            except User.DoesNotExist:
                continue

        try:
            with transaction.atomic():
                if usuario_obj:
                    proyecto.colaboradores.add(usuario_obj)
                    invitacion = Invitation.objects.create(
                        proyecto=proyecto,
                        correo_electronico=correo,
                        rol=rol,
                        estado=Invitation.ESTADO_ACEPTADA,
                        creado_por=request.user if request else None
                    )
                    return invitacion

                # no existe usuario -> crear pendiente
                invitacion = Invitation.objects.create(
                    proyecto=proyecto,
                    correo_electronico=correo,
                    rol=rol,
                    creado_por=request.user if request else None
                )
                return invitacion
        except IntegrityError:
            raise serializers.ValidationError({'detail': 'Conflicto al crear la invitación (posible duplicado).'})