from django.urls import path
from .jwt_views import TokenObtainPairView, TokenRefreshView
from .views import UsuarioListaCrear, UsuarioDetalleActualizarEliminar, user_me

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/usuarios/', UsuarioListaCrear.as_view(), name='usuario-lista-crear'),
    path('api/usuarios/<int:pk>/', UsuarioDetalleActualizarEliminar.as_view(), name='usuario-detalle'),
    path('api/me/', user_me, name='user-me'),
]