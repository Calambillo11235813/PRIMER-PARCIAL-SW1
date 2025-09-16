from django.urls import path
from usuario.views import (
    AutenticacionUsuario,
    UsuarioListaCrear,
    UsuarioDetalleActualizarEliminar,
    CerrarSesionUsuario,
    user_me,
    establecer_csrf,
)

urlpatterns = [
    path('api/login/', AutenticacionUsuario.as_view(), name='login_usuario'),
    path('api/logout/', CerrarSesionUsuario.as_view(), name='logout_usuario'),
    path('api/usuarios/', UsuarioListaCrear.as_view(), name='usuario_lista_crear'),
    path('api/usuarios/<int:pk>/', UsuarioDetalleActualizarEliminar.as_view(), name='usuario_detalle_actualizar_eliminar'),
    path('api/me/', user_me, name='user-me'),  # Unificado con prefijo api/
    path('api/csrf/', establecer_csrf, name='csrf'),
]