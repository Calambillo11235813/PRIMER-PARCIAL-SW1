from django.urls import path
from usuario.views import (
    AutenticacionUsuario,
    UsuarioListaCrear,
    UsuarioDetalleActualizarEliminar,
    CerrarSesionUsuario,
)

urlpatterns = [
    path('api/login/', AutenticacionUsuario.as_view(), name='login_usuario'),
    path('api/logout/', CerrarSesionUsuario.as_view(), name='logout_usuario'),
    path('api/usuarios/', UsuarioListaCrear.as_view(), name='usuario_lista_crear'),
    path('api/usuarios/<int:pk>/', UsuarioDetalleActualizarEliminar.as_view(), name='usuario_detalle_actualizar_eliminar'),
]