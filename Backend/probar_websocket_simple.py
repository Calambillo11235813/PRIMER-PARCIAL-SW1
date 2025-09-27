# probar_websocket_simple.py
import websocket
import json

def on_message(ws, message):
    print("📨 Mensaje recibido:", message)

def on_error(ws, error):
    print("❌ Error:", error)

def on_close(ws, close_status_code, close_msg):
    print("🔌 Conexión cerrada")

def on_open(ws):
    print("✅ Conexión abierta")
    # Enviar mensaje simple
    ws.send(json.dumps({"tipo": "ping"}))

if __name__ == "__main__":
    # Probar sin token primero
    ws_url = "ws://localhost:8000/ws/diagrama/1/"
    
    print(f"🔗 Conectando a: {ws_url} (sin autenticación)")
    
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(
        ws_url,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    try:
        ws.run_forever()
    except KeyboardInterrupt:
        print("\n🛑 Cerrando conexión...")