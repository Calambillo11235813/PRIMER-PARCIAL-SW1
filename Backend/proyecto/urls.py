from django.urls import path, include
from .views import ProyectoListaCrear, ProyectoDetalleActualizarEliminar, DiagramaClaseListaCrear, DiagramaClaseDetalleActualizarEliminar, ProyectosPorUsuario

urlpatterns = [
    path('api/proyectos/', ProyectoListaCrear.as_view(), name='proyecto-lista-crear'),
    path('api/proyectos/<int:pk>/', ProyectoDetalleActualizarEliminar.as_view(), name='proyecto-detalle'),
    path('api/proyectos/usuario/<int:usuario_id>/', ProyectosPorUsuario.as_view(), name='proyectos-por-usuario'),
    path('api/diagramas/', DiagramaClaseListaCrear.as_view(), name='diagrama-lista-crear'),
    path('api/diagramas/<int:pk>/', DiagramaClaseDetalleActualizarEliminar.as_view(), name='diagrama-detalle'),
]