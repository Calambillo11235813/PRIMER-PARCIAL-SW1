import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar WebSockets de colaboración en tiempo real
 */
export const useWebSocket = (diagramaId) => {
    const [estaConectado, setEstaConectado] = useState(false);
    const [usuariosConectados, setUsuariosConectados] = useState([]);
    const [ultimoCambio, setUltimoCambio] = useState(null);
    const [errores, setErrores] = useState([]);
    const ws = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const conectar = useCallback(() => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('❌ No hay token JWT disponible');
                return;
            }

            const url = `ws://localhost:8000/ws/diagrama/${diagramaId}/`;
            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                console.log('✅ WebSocket conectado al diagrama:', diagramaId);
                setEstaConectado(true);
                reconnectAttempts.current = 0;
                setErrores(prev => [...prev, { tipo: 'conexion', mensaje: 'Conectado al diagrama', timestamp: new Date() }]);
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    manejarMensaje(data);
                } catch (error) {
                    console.error('❌ Error parseando mensaje WebSocket:', error);
                }
            };

            ws.current.onclose = (event) => {
                console.log('🔌 WebSocket desconectado:', event.code, event.reason);
                setEstaConectado(false);
                
                // Reconexión automática
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    setTimeout(() => {
                        reconnectAttempts.current += 1;
                        console.log(`🔄 Intentando reconexión ${reconnectAttempts.current}/${maxReconnectAttempts}`);
                        conectar();
                    }, 3000);
                }
            };

            ws.current.onerror = (error) => {
                console.error('❌ Error WebSocket:', error);
                setErrores(prev => [...prev, { 
                    tipo: 'error', 
                    mensaje: 'Error de conexión WebSocket', 
                    timestamp: new Date() 
                }]);
            };

        } catch (error) {
            console.error('❌ Error conectando WebSocket:', error);
        }
    }, [diagramaId]);

    const manejarMensaje = (data) => {
        switch (data.tipo) {
            case 'conexion_establecida':
                console.log('✅ Conexión establecida con el diagrama');
                break;
                
            case 'usuario_conectado':
                setUsuariosConectados(data.usuarios_conectados || []);
                console.log(`👤 ${data.usuario_nombre} se conectó`);
                break;
                
            case 'usuario_desconectado':
                setUsuariosConectados(data.usuarios_conectados || []);
                console.log(`🚪 ${data.usuario_nombre} se desconectó`);
                break;
                
            case 'cambio_recibido':
                setUltimoCambio(data);
                console.log('🔄 Cambio recibido de:', data.usuario_nombre);
                // Aquí se integrará con el editor para aplicar cambios
                break;
                
            case 'cambio_confirmado':
                console.log('✅ Cambio confirmado por el servidor');
                break;
                
            case 'estado_sincronizado':
                console.log('🔄 Estado del diagrama sincronizado');
                break;
                
            case 'usuario_editando':
                console.log(`✏️ ${data.usuario_nombre} está editando elemento:`, data.elemento_id);
                break;
                
            case 'error':
                console.error('❌ Error del servidor:', data.mensaje);
                setErrores(prev => [...prev, { 
                    tipo: 'servidor', 
                    mensaje: data.mensaje, 
                    timestamp: new Date() 
                }]);
                break;
                
            default:
                console.log('📦 Mensaje no manejado:', data.tipo);
        }
    };

    const enviarCambio = useCallback((cambio) => {
        if (ws.current && estaConectado) {
            const mensaje = {
                tipo: 'cambio_diagrama',
                cambio: cambio
            };
            ws.current.send(JSON.stringify(mensaje));
            console.log('📤 Cambio enviado:', cambio.tipo);
        } else {
            console.warn('⚠️ WebSocket no conectado, no se puede enviar cambio');
        }
    }, [estaConectado]);

    const sincronizarEstado = useCallback(() => {
        if (ws.current && estaConectado) {
            ws.current.send(JSON.stringify({ tipo: 'sincronizar_estado' }));
        }
    }, [estaConectado]);

    const notificarEdicion = useCallback((elementoId, editando) => {
        if (ws.current && estaConectado) {
            const mensaje = {
                tipo: 'usuario_editando',
                elemento_id: elementoId,
                editando: editando
            };
            ws.current.send(JSON.stringify(mensaje));
        }
    }, [estaConectado]);

    useEffect(() => {
        if (diagramaId) {
            conectar();
        }

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [diagramaId, conectar]);

    return {
        estaConectado,
        usuariosConectados,
        ultimoCambio,
        errores,
        enviarCambio,
        sincronizarEstado,
        notificarEdicion
    };
};

/**
 * Servicio para crear tipos de cambios estandarizados
 */
export const CambioService = {
    crearNodo: (nodoData) => ({
        tipo: 'crear_nodo',
        datos: nodoData
    }),
    
    actualizarNodo: (nodoId, nuevosDatos) => ({
        tipo: 'actualizar_nodo',
        datos: { id: nodoId, ...nuevosDatos }
    }),
    
    eliminarNodo: (nodoId) => ({
        tipo: 'eliminar_nodo',
        datos: { id: nodoId }
    }),
    
    crearRelacion: (relacionData) => ({
        tipo: 'crear_relacion',
        datos: relacionData
    }),
    
    actualizarRelacion: (relacionId, nuevosDatos) => ({
        tipo: 'actualizar_relacion',
        datos: { id: relacionId, ...nuevosDatos }
    }),
    
    eliminarRelacion: (relacionId) => ({
        tipo: 'eliminar_relacion',
        datos: { id: relacionId }
    })
};

// Preferencia para Vite: use import.meta.env.VITE_WS_URL (defínelo en .env), si no usar fallback a la URL local
const DEFAULT_WS_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_URL) ||
  ((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws/');

let socket = null;
let subscribers = new Set();
let reconnectTimer = null;
let tokenForConnect = null;

function _notify(message) {
  subscribers.forEach((h) => {
    try { h(message); } catch (e) { console.error('ws subscriber error', e); }
  });
}

function _connect() {
  if (!tokenForConnect) return;
  const url = `${DEFAULT_WS_URL}?token=${encodeURIComponent(tokenForConnect)}`;
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.info('websocket connected');
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  };

  socket.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      _notify(data);
    } catch (e) {
      console.warn('ws message parse error', e);
    }
  };

  socket.onclose = () => {
    console.info('websocket closed, retrying in 2s');
    reconnectTimer = setTimeout(() => _connect(), 2000);
  };

  socket.onerror = (err) => {
    console.error('websocket error', err);
    socket.close();
  };
}

export const websocketService = {
  connect(token) {
    tokenForConnect = token;
    if (socket && socket.readyState === WebSocket.OPEN) return;
    _connect();
  },
  disconnect() {
    if (socket) { socket.close(); socket = null; }
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  },
  send(obj) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    try { socket.send(JSON.stringify(obj)); }
    catch (e) { console.error('ws send error', e); }
  },
  subscribe(handler) {
    subscribers.add(handler);
    return () => subscribers.delete(handler);
  },
  unsubscribe(handler) {
    subscribers.delete(handler);
  }
};

export default websocketService;