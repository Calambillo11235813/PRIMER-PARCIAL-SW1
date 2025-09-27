# probar_colaboracion_automatica.py
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

def obtener_diagrama_existente():
    """Obtiene el ID de un diagrama existente."""
    try:
        # Obtener lista de diagramas (usar endpoint API correcto)
        token = obtener_token_jwt()
        headers = {"Authorization": f"Bearer {token}"}  # se usa solo para la petición REST
        # <- CAMBIO: usar la ruta /api/diagramas/
        response = requests.get("http://localhost:8000/api/diagramas/", headers=headers)
        
        if response.status_code == 200:
            diagramas = response.json()
            if diagramas:
                return diagramas[0]['id']  # Usar el primer diagrama
        return 4  # Fallback al ID que sabemos que existe
    except:
        return 4  # Fallback

class ClienteColaboracion:
    def __init__(self, nombre):
        self.nombre = nombre
        self.token = obtener_token_jwt()
        if not self.token:
            print(f"❌ {self.nombre}: no se obtuvo token JWT. Verifica credenciales y servidor.")
        self.ws = None
        self.diagrama_id = obtener_diagrama_existente()
        
    def conectar(self):
        """Conecta al WebSocket del diagrama existente."""
        if not self.token:
            print(f"⛔ {self.nombre}: abortando conexión por falta de token.")
            return

        ws_url = f"ws://localhost:8000/ws/diagrama/{self.diagrama_id}/"
        # Enviar solo Authorization como lista de strings para evitar Origin malformado
        header_list = [f"Authorization: Bearer {self.token}"]

        print(f"🔗 {self.nombre} conectando a diagrama {self.diagrama_id} (handshake...)")
        try:
            # Intento SIN Origin (evita errores de handshake por Origin malformado)
            self.ws = websocket.WebSocketApp(
                ws_url,
                header=header_list,
                on_message=self.on_message,
                on_error=self.on_error,
                on_open=self.on_open,
                on_close=self.on_close
            )
            self.thread = threading.Thread(target=self.ws.run_forever)
            self.thread.daemon = True
            self.thread.start()
            # esperar breve tiempo para detectar handshake error
            time.sleep(0.5)
        except Exception as e:
            print(f"❌ {self.nombre}: fallo al iniciar WebSocket: {e}")
    
    def on_message(self, ws, message):
        data = json.loads(message)
        print(f"👤 {self.nombre} recibió: {data['tipo']}")
        
        if data['tipo'] == 'error':
            print(f"   ❌ Error: {data.get('mensaje', 'Desconocido')}")
        elif data['tipo'] == 'cambio_recibido':
            print(f"   🔄 Cambio de {data['usuario_nombre']}: {data['cambio']['tipo']}")
        elif data['tipo'] == 'cambio_confirmado':
            print(f"   ✅ Cambio confirmado: {data.get('cambio_id', 'N/A')}")
    
    def on_error(self, ws, error):
        print(f"❌ {self.nombre} error: {error}")
    
    def on_open(self, ws):
        print(f"✅ {self.nombre} conectado al diagrama {self.diagrama_id}")
        
        # usar el ws que recibe el callback para enviar mensajes inmediatos
        time.sleep(1)
        ws.send(json.dumps({"tipo": "sincronizar_estado"}))
        threading.Timer(3, self.simular_cambios).start()
    
    def on_close(self, ws, close_status_code, close_msg):
        print(f"🔌 {self.nombre} desconectado")
    
    def enviar_sincronizacion(self):
        """Solicita sincronización del estado del diagrama."""
        if self.ws:
            self.ws.send(json.dumps({"tipo": "sincronizar_estado"}))
    
    def simular_cambios(self):
        """Simula cambios en el diagrama."""
        cambios = [
            {
                "tipo": "crear_nodo",
                "datos": {
                    "id": f"nodo_{self.nombre}",
                    "tipo": "clase",
                    "nombre": f"Clase{self.nombre}",
                    "x": 100,
                    "y": 200
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
        if self.ws:
            self.ws.close()

if __name__ == "__main__":
    print("🚀 INICIANDO PRUEBA CON DIAGRAMA EXISTENTE")
    print("=" * 50)
    
    cliente1 = ClienteColaboracion("Usuario1")
    cliente2 = ClienteColaboracion("Usuario2")
    
    cliente1.conectar()
    time.sleep(1)
    cliente2.conectar()
    
    try:
        time.sleep(10)
        print("\n⏰ Prueba completada")
    except KeyboardInterrupt:
        print("\n🛑 Prueba interrumpida")
    
    cliente1.cerrar()
    cliente2.cerrar()