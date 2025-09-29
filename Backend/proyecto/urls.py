from django.urls import path

# importar desde los módulos separados
from .views_proyectos import (
    ProyectoListaCrear,
    ProyectoDetalleActualizarEliminar,
    DiagramaClaseListaCrear,
    DiagramaClaseDetalleActualizarEliminar,
    ColaboradorEliminarAPIView,
    ProyectosPorUsuario,
    ColaboradoresListAPIView,  # <-- nuevo
)
from .views_invitaciones import (
    InvitacionCrearAPIView,
    InvitacionListCreateAPIView,
    InvitacionAceptarAPIView,
)

urlpatterns = [
    path('proyectos/', ProyectoListaCrear.as_view(), name='proyecto-lista-crear'),
    path('proyectos/<int:pk>/', ProyectoDetalleActualizarEliminar.as_view(), name='proyecto-detalle'),
    path('proyectos/<int:pk>/colaboradores/', ColaboradoresListAPIView.as_view(), name='listar-colaboradores'),  # <-- nuevo
    path('proyectos/<int:pk>/colaboradores/<int:user_id>/', ColaboradorEliminarAPIView.as_view(), name='eliminar-colaborador'),
    # listado de proyectos por usuario (agregado)
    path('proyectos/usuario/<int:usuario_id>/', ProyectosPorUsuario.as_view(), name='proyectos-por-usuario'),
    # diagramas
    path('diagramas/', DiagramaClaseListaCrear.as_view(), name='diagrama-lista-crear'),
    path('diagramas/<int:pk>/', DiagramaClaseDetalleActualizarEliminar.as_view(), name='diagrama-detalle'),

    # colaboradores: eliminar colaborador
    # DELETE /api/proyectos/<pk>/colaboradores/<user_id>/
    path('proyectos/<int:pk>/colaboradores/<int:user_id>/', ColaboradorEliminarAPIView.as_view(), name='eliminar-colaborador'),

    # invitaciones
    path('proyectos/<int:pk>/invitaciones/', InvitacionListCreateAPIView.as_view(), name='proyecto-invitaciones'),
    path('invitaciones/aceptar/', InvitacionAceptarAPIView.as_view(), name='invitar-acept'),
]