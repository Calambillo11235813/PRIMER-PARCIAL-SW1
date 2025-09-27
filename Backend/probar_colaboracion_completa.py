# probar_colaboracion_completa.py
import websocket
import json
import time
import threading
import requests

def obtener_token_jwt():
    """Obtiene un token JWT válido."""
    try:
        login_data = {
            "correo_electronico": "test@ejemplo.com",
            "password": "password123"
        }
        
        response = requests.post("http://localhost:8000/api/token/", json=login_data)
        if response.status_code == 200:
            return response.json()['access']
        return None
    except:
        return None

class ClienteColaboracion:
    def __init__(self, nombre):
        self.nombre = nombre
        self.token = obtener_token_jwt()
        self.ws = None
        
    def conectar(self, diagrama_id=1):
        """Conecta al WebSocket del diagrama."""
        ws_url = f"ws://localhost:8000/ws/diagrama/{diagrama_id}/"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        self.ws = websocket.WebSocketApp(
            ws_url,
            header=headers,
            on_message=self.on_message,
            on_error=self.on_error,
            on_open=self.on_open,
            on_close=self.on_close
        )
        
        # Ejecutar en un hilo separado
        self.thread = threading.Thread(target=self.ws.run_forever)
        self.thread.daemon = True
        self.thread.start()
    
    def on_message(self, ws, message):
        data = json.loads(message)
        print(f"👤 {self.nombre} recibió: {data['tipo']}")
        
        if data['tipo'] == 'cambio_recibido':
            print(f"   🔄 Cambio de {data['usuario_nombre']}: {data['cambio']['tipo']}")
    
    def on_error(self, ws, error):
        print(f"❌ {self.nombre} error: {error}")
    
    def on_open(self, ws):
        print(f"✅ {self.nombre} conectado al diagrama")
        
        # Enviar sincronización después de conectar
        time.sleep(1)
        self.enviar_sincronizacion()
        
        # Simular cambios después de 3 segundos
        threading.Timer(3, self.simular_cambios).start()
    
    def on_close(self, ws, close_status_code, close_msg):
        print(f"🔌 {self.nombre} desconectado")
    
    def enviar_sincronizacion(self):
        """Solicita sincronización del estado del diagrama."""
        if self.ws:
            self.ws.send(json.dumps({"tipo": "sincronizar_estado"}))
            print(f"📡 {self.nombre} solicitando sincronización")
    
    def simular_cambios(self):
        """Simula cambios en el diagrama."""
        cambios = [
            {
                "tipo": "crear_nodo",
                "datos": {
                    "id": f"nodo_{self.nombre}_{int(time.time())}",
                    "tipo": "clase",
                    "nombre": f"Clase{self.nombre}",
                    "x": 100,
                    "y": 200
                }
            },
            {
                "tipo": "crear_relacion", 
                "datos": {
                    "id": f"rel_{self.nombre}_{int(time.time())}",
                    "origen": f"nodo_{self.nombre}",
                    "destino": "nodo_existente",
                    "tipo": "asociacion"
                }
            }
        ]
        
        for cambio in cambios:
            if self.ws:
                mensaje = {
                    "tipo": "cambio_diagrama",
                    "cambio": cambio
                }
                self.ws.send(json.dumps(mensaje))
                print(f"✏️  {self.nombre} envió cambio: {cambio['tipo']}")
            time.sleep(2)
    
    def cerrar(self):
        """Cierra la conexión."""
        if self.ws:
            self.ws.close()

# Probar con múltiples clientes simulando colaboración
if __name__ == "__main__":
    print("🚀 INICIANDO PRUEBA DE COLABORACIÓN EN TIEMPO REAL")
    print("=" * 50)
    
    # Crear clientes simulados
    cliente1 = ClienteColaboracion("Usuario1")
    cliente2 = ClienteColaboracion("Usuario2")
    
    # Conectar clientes
    cliente1.conectar(1)
    time.sleep(1)  # Esperar entre conexiones
    cliente2.conectar(1)
    
    # Mantener la prueba ejecutándose por 10 segundos
    try:
        time.sleep(10)
        print("\n⏰ Prueba completada")
    except KeyboardInterrupt:
        print("\n🛑 Prueba interrumpida")
    
    # Cerrar conexiones
    cliente1.cerrar()
    cliente2.cerrar()