from django.shortcuts import render
from rest_framework import generics
from .models import Proyecto, DiagramaClase
from .serializer import ProyectoSerializer, DiagramaClaseSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

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
    permission_classes = [AllowAny]  # Permite acceso sin autenticación

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
    permission_classes = [AllowAny]  # Permite acceso sin autenticación


class DiagramaClaseListaCrear(generics.ListCreateAPIView):
    """
    GET /diagramas/
    Lista todos los diagramas de clases.

    POST /diagramas/
    Crea un nuevo diagrama de clases.

    Ejemplo de JSON para POST:
    {
        "nombre": "Diagrama de Ventas",
        "descripcion": "Diagrama de clases para el módulo de ventas",
        "proyecto": 1,
        "estructura": {
            "clases": [
                {"nombre": "Producto", "atributos": ["id", "nombre", "precio"]},
                {"nombre": "Venta", "atributos": ["id", "fecha", "total"]}
            ],
            "relaciones": [
                {"origen": "Venta", "destino": "Producto", "tipo": "asociación"}
            ]
        }
    }
    """
    queryset = DiagramaClase.objects.all()
    serializer_class = DiagramaClaseSerializer
    permission_classes = [AllowAny]

class DiagramaClaseDetalleActualizarEliminar(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /diagramas/<id>/
    Obtiene los detalles de un diagrama de clases.

    PUT /diagramas/<id>/
    Actualiza los datos de un diagrama de clases.

    Ejemplo de JSON para PUT:
    {
        "nombre": "Diagrama de Ventas Actualizado",
        "descripcion": "Actualización del diagrama de clases para ventas",
        "proyecto":4,
        "estructura": {
            "clases": [
                {"nombre": "Producto", "atributos": ["id", "nombre", "precio", "stock"]},
                {"nombre": "Venta", "atributos": ["id", "fecha", "total", "cliente"]}
            ],
            "relaciones": [
                {"origen": "Venta", "destino": "Producto", "tipo": "asociación"}
            ]
        }
    }

    DELETE /diagramas/<id>/
    Elimina un diagrama de clases.
    """
    queryset = DiagramaClase.objects.all()
    serializer_class = DiagramaClaseSerializer
    permission_classes = [AllowAny]

    # NUEVO: tratar PUT como actualización parcial para permitir enviar solo "estructura"
    def put(self, request, *args, **kwargs):
        """
        Permitimos que PUT actúe como partial_update para que el cliente pueda enviar
        únicamente el campo 'estructura' (clases/relaciones) sin que fallen las validaciones
        de campos obligatorios que no se estén modificando.
        """
        return self.partial_update(request, *args, **kwargs)
