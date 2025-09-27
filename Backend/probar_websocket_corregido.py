# probar_websocket_corregido.py
import websocket
import json
import requests

def obtener_token_jwt():
    """Obtiene un token JWT válido."""
    try:
        # Login para obtener token
        login_data = {
            "correo_electronico": "test@ejemplo.com",
            "password": "password123"
        }
        
        response = requests.post(
            "http://localhost:8000/api/token/",
            json=login_data
        )
        
        if response.status_code == 200:
            return response.json()['access']
        return None
    except:
        return None

def on_message(ws, message):
    print("📨 Mensaje recibido:", message)

def on_error(ws, error):
    print("❌ Error:", error)

def on_close(ws, close_status_code, close_msg):
    print("🔌 Conexión cerrada")

def on_open(ws):
    print("✅ Conexión WebSocket abierta con autenticación JWT")
    ws.send(json.dumps({"tipo": "ping"}))

if __name__ == "__main__":
    token = obtener_token_jwt()
    if not token:
        print("❌ No se pudo obtener token JWT")
        exit(1)
    
    ws_url = "ws://localhost:8000/ws/diagrama/1/"
    
    # Configurar headers con token
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print(f"🔗 Conectando a: {ws_url} con token JWT")
    
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(
        ws_url,
        header=headers,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    try:
        ws.run_forever()
    except KeyboardInterrupt:
        print("\n🛑 Cerrando conexión...")