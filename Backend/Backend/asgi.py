import os
from django.core.asgi import get_asgi_application

# ✅ PRIMERO: Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

# ✅ Obtener aplicación HTTP
django_application = get_asgi_application()

# ✅ LUEGO: Importar Channels
from channels.routing import ProtocolTypeRouter, URLRouter

# ✅ Importar middleware personalizado
from colaboracion_tiempo_real.middleware import JWTAuthMiddleware

# ✅ Cargar WebSocket patterns de manera segura
def get_websocket_patterns():
    try:
        from colaboracion_tiempo_real.routing import websocket_urlpatterns
        return websocket_urlpatterns
    except Exception as e:
        print(f"⚠️ Error cargando WebSocket patterns: {e}")
        return []

# ✅ Aplicar middleware JWT a los WebSockets
websocket_application = JWTAuthMiddleware(URLRouter(get_websocket_patterns()))

application = ProtocolTypeRouter({
    "http": django_application,
    "websocket": websocket_application,  # ← Usar con middleware JWT
})