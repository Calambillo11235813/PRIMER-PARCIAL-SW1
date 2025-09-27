# proyecto/permissions.py
class EsPropietarioOColaborador(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.usuario_tiene_acceso(request.user)