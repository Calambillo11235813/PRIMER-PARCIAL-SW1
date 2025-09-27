# routing.py - VERSIÓN MEJORADA
from django.urls import re_path

def get_websocket_urlpatterns():
    """
    Carga los patterns WebSocket de manera diferida para evitar errores de importación.
    """
    from .consumers import DiagramaConsumer
    
    return [
        re_path(
            r'ws/diagrama/(?P<diagrama_id>\w+)/$',
            DiagramaConsumer.as_asgi()
        ),
    ]

websocket_urlpatterns = get_websocket_urlpatterns()