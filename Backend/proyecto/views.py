from django.shortcuts import render
from rest_framework import generics
from .models import Proyecto
from .serializer import ProyectoSerializer

class ProyectoListaCrear(generics.ListCreateAPIView):
    """
    GET /proyectos/
    Lista todos los proyectos.

    POST /proyectos/
    Crea un nuevo proyecto.

    Ejemplo de JSON para POST:
    {
        "nombre": "Proyecto UML Ejemplo",
        "descripcion": "Descripción del proyecto"
    }
    """
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    # Removido permission_classes para permitir acceso sin autenticación

    def perform_create(self, serializer):
        """
        Asigna el creador solo si el usuario está autenticado; de lo contrario, deja null.
        """
        if self.request.user.is_authenticated:
            serializer.save(creador=self.request.user)
        else:
            serializer.save()  # Sin creador

class ProyectoDetalleActualizarEliminar(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /proyectos/<id>/
    Obtiene los detalles de un proyecto específico.

    PUT /proyectos/<id>/
    Actualiza los datos de un proyecto.

    Ejemplo de JSON para PUT:
    {
        "nombre": "Proyecto UML Actualizado",
        "descripcion": "Descripción actualizada del proyecto"
    }

    DELETE /proyectos/<id>/
    Elimina un proyecto.
    """
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    # Removido permission_classes para permitir acceso sin autenticación
