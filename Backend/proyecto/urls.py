from django.urls import path
from .views import (
    ProyectoListaCrear,
    ProyectoDetalleActualizarEliminar,
    DiagramaClaseListaCrear,
    DiagramaClaseDetalleActualizarEliminar,
    ProyectosPorUsuario,
    InvitacionCrearAPIView,
    InvitacionAceptarAPIView,
)

urlpatterns = [
    path('api/proyectos/', ProyectoListaCrear.as_view(), name='proyecto-lista-crear'),
    path('api/proyectos/<int:pk>/', ProyectoDetalleActualizarEliminar.as_view(), name='proyecto-detalle'),
    path('api/proyectos/usuario/<int:usuario_id>/', ProyectosPorUsuario.as_view(), name='proyectos-por-usuario'),
    path('api/diagramas/', DiagramaClaseListaCrear.as_view(), name='diagrama-lista-crear'),
    path('api/diagramas/<int:pk>/', DiagramaClaseDetalleActualizarEliminar.as_view(), name='diagrama-detalle'),
    path('api/proyectos/<int:pk>/invitaciones/', InvitacionCrearAPIView.as_view(), name='proyecto-invitaciones'),
    path('api/invitaciones/aceptar/', InvitacionAceptarAPIView.as_view(), name='invitar-acept'),
]