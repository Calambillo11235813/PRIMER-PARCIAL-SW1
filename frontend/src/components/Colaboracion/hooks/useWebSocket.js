import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar WebSockets de colaboración en tiempo real
 * Gestiona conexiones, reconexión automática y sincronización de cambios
 */
export const useWebSocket = (diagramaId) => {
    const [estaConectado, setEstaConectado] = useState(false);
    const [usuariosConectados, setUsuariosConectados] = useState([]);
    const [ultimoCambio, setUltimoCambio] = useState(null);
    const [errores, setErrores] = useState([]);
    const [usuariosEditando, setUsuariosEditando] = useState({}); // Nuevo: rastrear quién está editando
    
    const ws = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectTimeout = useRef(null);

    /**
     * Establece conexión WebSocket con autenticación JWT
     */
    const conectar = useCallback(() => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('❌ No hay token JWT disponible');
                return;
            }

            // Limpiar timeout de reconexión previo
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }

            const url = `ws://localhost:8000/ws/diagrama/${diagramaId}/`;
            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                console.log('✅ WebSocket conectado al diagrama:', diagramaId);
                setEstaConectado(true);
                reconnectAttempts.current = 0;
                
                // Autenticar después de conectar
                ws.current.send(JSON.stringify({
                    tipo: 'autenticar',
                    token: token
                }));
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    manejarMensaje(data);
                } catch (error) {
                    console.error('❌ Error parseando mensaje WebSocket:', error);
                    agregarError('parse', 'Error procesando mensaje del servidor');
                }
            };

            ws.current.onclose = (event) => {
                console.log('🔌 WebSocket desconectado:', event.code, event.reason);
                setEstaConectado(false);
                setUsuariosEditando({}); // Limpiar usuarios editando
                
                // Reconexión automática con backoff exponencial
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.min(3000 * Math.pow(2, reconnectAttempts.current), 30000);
                    
                    reconnectTimeout.current = setTimeout(() => {
                        reconnectAttempts.current += 1;
                        console.log(`🔄 Intentando reconexión ${reconnectAttempts.current}/${maxReconnectAttempts}`);
                        conectar();
                    }, delay);
                } else {
                    agregarError('conexion', 'No se pudo reconectar. Refresca la página.');
                }
            };

            ws.current.onerror = (error) => {
                console.error('❌ Error WebSocket:', error);
                agregarError('error', 'Error de conexión WebSocket');
            };

        } catch (error) {
            console.error('❌ Error conectando WebSocket:', error);
            agregarError('conexion', 'Error al conectar con el servidor');
        }
    }, [diagramaId]);

    /**
     * Agrega error al estado con límite de errores
     */
    const agregarError = useCallback((tipo, mensaje) => {
        setErrores(prev => [...prev.slice(-4), { 
            tipo, 
            mensaje, 
            timestamp: new Date() 
        }]);
    }, []);

    /**
     * Procesa mensajes recibidos del WebSocket
     */
    const manejarMensaje = useCallback((data) => {
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
                break;
                
            case 'cambio_confirmado':
                console.log('✅ Cambio confirmado por el servidor');
                break;
                
            case 'estado_sincronizado':
                console.log('🔄 Estado del diagrama sincronizado');
                break;
                
            case 'usuario_editando':
                setUsuariosEditando(prev => ({
                    ...prev,
                    [data.elemento_id]: {
                        usuario: data.usuario_nombre,
                        editando: data.editando,
                        timestamp: Date.now()
                    }
                }));
                console.log(`✏️ ${data.usuario_nombre} está editando:`, data.elemento_id);
                break;
                
            case 'error':
                console.error('❌ Error del servidor:', data.mensaje);
                agregarError('servidor', data.mensaje);
                break;
                
            case 'pong':
                // Respuesta al ping - mantener conexión viva
                break;
                
            default:
                console.log('📦 Mensaje no manejado:', data.tipo);
        }
    }, [agregarError]);

    /**
     * Envía un cambio al servidor
     */
    const enviarCambio = useCallback((cambio) => {
        if (ws.current && estaConectado) {
            const mensaje = {
                tipo: 'cambio_diagrama',
                cambio: cambio,
                timestamp: Date.now()
            };
            ws.current.send(JSON.stringify(mensaje));
            console.log('📤 Cambio enviado:', cambio.tipo);
        } else {
            console.warn('⚠️ WebSocket no conectado, cambio no enviado');
            agregarError('envio', 'No conectado. El cambio se guardará localmente.');
        }
    }, [estaConectado, agregarError]);

    /**
     * Solicita sincronización del estado del diagrama
     */
    const sincronizarEstado = useCallback(() => {
        if (ws.current && estaConectado) {
            ws.current.send(JSON.stringify({ tipo: 'sincronizar_estado' }));
            console.log('🔄 Solicitando sincronización de estado');
        }
    }, [estaConectado]);

    /**
     * Notifica que un usuario está editando un elemento
     */
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

    /**
     * Desconecta manualmente el WebSocket
     */
    const desconectar = useCallback(() => {
        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
        }
        if (ws.current) {
            ws.current.close(1000, 'Desconexión manual');
        }
    }, []);

    // Efecto principal de conexión
    useEffect(() => {
        if (diagramaId) {
            conectar();
        }

        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [diagramaId, conectar]);

    // Heartbeat para mantener conexión viva
    useEffect(() => {
        if (estaConectado) {
            const heartbeat = setInterval(() => {
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({ tipo: 'ping' }));
                }
            }, 30000);

            return () => clearInterval(heartbeat);
        }
    }, [estaConectado]);

    return {
        estaConectado,
        usuariosConectados,
        usuariosEditando, // Nuevo
        ultimoCambio,
        errores,
        enviarCambio,
        sincronizarEstado,
        notificarEdicion,
        desconectar // Nuevo
    };
};

/**
 * Servicio para crear tipos de cambios estandarizados
 */
export const CambioService = {
    // Operaciones con nodos
    crearNodo: (nodoData) => ({
        tipo: 'crear_nodo',
        datos: nodoData,
        timestamp: Date.now()
    }),
    
    actualizarNodo: (nodoId, nuevosDatos) => ({
        tipo: 'actualizar_nodo',
        datos: { id: nodoId, ...nuevosDatos },
        timestamp: Date.now()
    }),
    
    eliminarNodo: (nodoId) => ({
        tipo: 'eliminar_nodo',
        datos: { id: nodoId },
        timestamp: Date.now()
    }),

    // Operaciones con relaciones
    crearRelacion: (relacionData) => ({
        tipo: 'crear_relacion',
        datos: relacionData,
        timestamp: Date.now()
    }),
    
    actualizarRelacion: (relacionId, nuevosDatos) => ({
        tipo: 'actualizar_relacion',
        datos: { id: relacionId, ...nuevosDatos },
        timestamp: Date.now()
    }),
    
    eliminarRelacion: (relacionId) => ({
        tipo: 'eliminar_relacion',
        datos: { id: relacionId },
        timestamp: Date.now()
    }),

    // Operaciones batch
    batchCambios: (cambios) => ({
        tipo: 'batch_cambios',
        datos: cambios,
        timestamp: Date.now()
    })
};