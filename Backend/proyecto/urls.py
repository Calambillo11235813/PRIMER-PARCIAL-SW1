from django.urls import path, include
from .views import ProyectoListaCrear, ProyectoDetalleActualizarEliminar

urlpatterns = [
    path('api/proyectos/', ProyectoListaCrear.as_view(), name='proyecto-lista-crear'),
    path('api/proyectos/<int:pk>/', ProyectoDetalleActualizarEliminar.as_view(), name='proyecto-detalle'),
    path('api/', include('usuario.urls')),  # Asegúrate de que esté incluido
]