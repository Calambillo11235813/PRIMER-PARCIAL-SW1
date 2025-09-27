/**
 * Servicio centralizado para gestionar la colaboración en tiempo real
 * Maneja la lógica de negocio, validaciones y transformaciones de datos
 */

/**
 * Configuración del servicio
 */
const COLABORACION_CONFIG = {
    WEBSOCKET_URL: 'ws://localhost:8000/ws/diagrama/',
    HEARTBEAT_INTERVAL: 30000, // 30 segundos
    MAX_RECONNECT_ATTEMPTS: 5,
    DEBOUNCE_DELAY: 300, // Para cambios frecuentes
    MAX_ERRORES_HISTORIA: 10
};

/**
 * Tipos de eventos de colaboración
 */
export const EVENTOS_COLABORACION = {
    // Eventos de conexión
    CONECTADO: 'conectado',
    DESCONECTADO: 'desconectado',
    ERROR_CONEXION: 'error_conexion',
    RECONECTANDO: 'reconectando',

    // Eventos de usuarios  
    USUARIO_CONECTADO: 'usuario_conectado',
    USUARIO_DESCONECTADO: 'usuario_desconectado',
    USUARIO_EDITANDO: 'usuario_editando',
    USUARIOS_ACTUALIZADOS: 'usuarios_actualizados',

    // Eventos de diagrama
    CAMBIO_APLICADO: 'cambio_aplicado',
    CAMBIO_RECIBIDO: 'cambio_recibido',
    ESTADO_SINCRONIZADO: 'estado_sincronizado',
    CONFLICTO_DETECTADO: 'conflicto_detectado',

    // Eventos de notificación
    NOTIFICACION_CREADA: 'notificacion_creada',
    ERROR_PROCESADO: 'error_procesado'
};

/**
 * Clase principal del servicio de colaboración
 */
class ColaboracionService {
    constructor() {
        this.eventListeners = new Map();
        this.cambiosPendientes = new Map(); // Para manejar conflictos
        this.debounceTimers = new Map();
        this.estadoLocal = null;
    }

    /**
     * Registra un listener para eventos de colaboración
     */
    on(evento, callback) {
        if (!this.eventListeners.has(evento)) {
            this.eventListeners.set(evento, []);
        }
        this.eventListeners.get(evento).push(callback);

        // Devolver función para desregistrar
        return () => {
            const listeners = this.eventListeners.get(evento);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }

    /**
     * Emite un evento a todos los listeners
     */
    emit(evento, datos = null) {
        const listeners = this.eventListeners.get(evento);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(datos);
                } catch (error) {
                    console.error(`❌ Error en listener de ${evento}:`, error);
                }
            });
        }
    }

    /**
     * Valida un cambio antes de enviarlo
     */
    validarCambio(cambio) {
        if (!cambio || typeof cambio !== 'object') {
            throw new Error('El cambio debe ser un objeto válido');
        }

        if (!cambio.tipo) {
            throw new Error('El cambio debe tener un tipo definido');
        }

        if (!cambio.datos) {
            throw new Error('El cambio debe tener datos asociados');
        }

        // Validaciones específicas por tipo
        switch (cambio.tipo) {
            case 'crear_nodo':
            case 'actualizar_nodo':
                if (!cambio.datos.id) {
                    throw new Error('Los cambios de nodo requieren un ID');
                }
                break;

            case 'crear_relacion':
            case 'actualizar_relacion':
                if (!cambio.datos.source || !cambio.datos.target) {
                    throw new Error('Las relaciones requieren source y target');
                }
                break;

            case 'eliminar_nodo':
            case 'eliminar_relacion':
                if (!cambio.datos.id) {
                    throw new Error('La eliminación requiere un ID');
                }
                break;
        }

        return true;
    }

    /**
     * Procesa un cambio recibido y detecta conflictos
     */
    procesarCambioRecibido(cambioRemoto, estadoActual) {
        try {
            // Validar cambio recibido
            this.validarCambio(cambioRemoto.cambio);

            // Detectar conflictos
            const conflicto = this.detectarConflicto(cambioRemoto, estadoActual);
            
            if (conflicto) {
                this.emit(EVENTOS_COLABORACION.CONFLICTO_DETECTADO, {
                    cambioRemoto,
                    conflicto,
                    estrategias: this.obtenerEstrategiasResolucion(conflicto)
                });
                return null; // No aplicar cambio hasta resolver conflicto
            }

            // Aplicar cambio si no hay conflictos
            const nuevoEstado = this.aplicarCambio(cambioRemoto.cambio, estadoActual);
            
            this.emit(EVENTOS_COLABORACION.CAMBIO_APLICADO, {
                cambio: cambioRemoto.cambio,
                usuario: cambioRemoto.usuario_nombre,
                estadoAnterior: estadoActual,
                estadoNuevo: nuevoEstado
            });

            return nuevoEstado;

        } catch (error) {
            console.error('❌ Error procesando cambio recibido:', error);
            this.emit(EVENTOS_COLABORACION.ERROR_PROCESADO, {
                error: error.message,
                cambio: cambioRemoto
            });
            return null;
        }
    }

    /**
     * Detecta conflictos entre cambios locales y remotos
     */
    detectarConflicto(cambioRemoto, estadoActual) {
        const { cambio } = cambioRemoto;
        
        // Verificar si hay cambios pendientes para el mismo elemento
        const elementoId = cambio.datos.id;
        const cambioPendiente = this.cambiosPendientes.get(elementoId);
        
        if (cambioPendiente) {
            // Verificar timestamp para determinar precedencia
            if (cambioRemoto.timestamp < cambioPendiente.timestamp) {
                return {
                    tipo: 'timestamp_conflict',
                    elementoId,
                    cambioLocal: cambioPendiente,
                    cambioRemoto: cambioRemoto
                };
            }
        }

        // Verificar conflictos específicos por tipo
        switch (cambio.tipo) {
            case 'eliminar_nodo':
                // Verificar si el nodo existe
                const nodoExiste = estadoActual.nodos?.some(n => n.id === elementoId);
                if (!nodoExiste) {
                    return {
                        tipo: 'elemento_no_existe',
                        elementoId,
                        operacion: 'eliminar_nodo'
                    };
                }
                break;

            case 'actualizar_nodo':
                // Verificar si el nodo existe y no fue eliminado
                const nodoParaActualizar = estadoActual.nodos?.find(n => n.id === elementoId);
                if (!nodoParaActualizar) {
                    return {
                        tipo: 'elemento_no_existe',
                        elementoId,
                        operacion: 'actualizar_nodo'
                    };
                }
                break;
        }

        return null; // No hay conflicto
    }

    /**
     * Aplica un cambio al estado actual
     */
    aplicarCambio(cambio, estadoActual) {
        const nuevoEstado = JSON.parse(JSON.stringify(estadoActual)); // Deep clone
        
        switch (cambio.tipo) {
            case 'crear_nodo':
                if (!nuevoEstado.nodos) nuevoEstado.nodos = [];
                nuevoEstado.nodos.push(cambio.datos);
                break;

            case 'actualizar_nodo':
                if (nuevoEstado.nodos) {
                    const index = nuevoEstado.nodos.findIndex(n => n.id === cambio.datos.id);
                    if (index !== -1) {
                        nuevoEstado.nodos[index] = { ...nuevoEstado.nodos[index], ...cambio.datos };
                    }
                }
                break;

            case 'eliminar_nodo':
                if (nuevoEstado.nodos) {
                    nuevoEstado.nodos = nuevoEstado.nodos.filter(n => n.id !== cambio.datos.id);
                }
                // También eliminar relaciones asociadas
                if (nuevoEstado.relaciones) {
                    nuevoEstado.relaciones = nuevoEstado.relaciones.filter(r => 
                        r.source !== cambio.datos.id && r.target !== cambio.datos.id
                    );
                }
                break;

            case 'crear_relacion':
                if (!nuevoEstado.relaciones) nuevoEstado.relaciones = [];
                nuevoEstado.relaciones.push(cambio.datos);
                break;

            case 'actualizar_relacion':
                if (nuevoEstado.relaciones) {
                    const index = nuevoEstado.relaciones.findIndex(r => r.id === cambio.datos.id);
                    if (index !== -1) {
                        nuevoEstado.relaciones[index] = { ...nuevoEstado.relaciones[index], ...cambio.datos };
                    }
                }
                break;

            case 'eliminar_relacion':
                if (nuevoEstado.relaciones) {
                    nuevoEstado.relaciones = nuevoEstado.relaciones.filter(r => r.id !== cambio.datos.id);
                }
                break;

            default:
                console.warn('⚠️ Tipo de cambio no reconocido:', cambio.tipo);
        }

        return nuevoEstado;
    }

    /**
     * Obtiene estrategias para resolver conflictos
     */
    obtenerEstrategiasResolucion(conflicto) {
        const estrategias = [];

        switch (conflicto.tipo) {
            case 'timestamp_conflict':
                estrategias.push({
                    id: 'aceptar_remoto',
                    descripcion: 'Aceptar cambio del colaborador',
                    accion: 'aplicar_cambio_remoto'
                });
                estrategias.push({
                    id: 'mantener_local',
                    descripcion: 'Mantener mi cambio',
                    accion: 'rechazar_cambio_remoto'
                });
                estrategias.push({
                    id: 'fusionar',
                    descripcion: 'Intentar fusionar cambios',
                    accion: 'fusionar_cambios'
                });
                break;

            case 'elemento_no_existe':
                estrategias.push({
                    id: 'ignorar',
                    descripcion: 'Ignorar el cambio',
                    accion: 'ignorar_cambio'
                });
                estrategias.push({
                    id: 'recrear_elemento',
                    descripcion: 'Recrear el elemento eliminado',
                    accion: 'recrear_elemento'
                });
                break;
        }

        return estrategias;
    }

    /**
     * Marca un cambio como pendiente
     */
    marcarCambioPendiente(cambio) {
        if (cambio.datos.id) {
            this.cambiosPendientes.set(cambio.datos.id, {
                ...cambio,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Remueve un cambio de pendientes
     */
    removerCambioPendiente(elementoId) {
        this.cambiosPendientes.delete(elementoId);
    }

    /**
     * Limpia todos los cambios pendientes
     */
    limpiarCambiosPendientes() {
        this.cambiosPendientes.clear();
    }

    /**
     * Crea una notificación para el usuario
     */
    crearNotificacion(tipo, mensaje, datos = {}) {
        const notificacion = {
            id: `notif-${Date.now()}`,
            tipo,
            mensaje,
            datos,
            timestamp: new Date(),
            leida: false
        };

        this.emit(EVENTOS_COLABORACION.NOTIFICACION_CREADA, notificacion);
        return notificacion;
    }

    /**
     * Limpia listeners y recursos
     */
    destruir() {
        this.eventListeners.clear();
        this.cambiosPendientes.clear();
        
        // Limpiar timers de debounce
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
    }
}

// Instancia singleton del servicio
const colaboracionService = new ColaboracionService();

/**
 * Factory functions para crear cambios tipados
 */
export const CreadorDeCambios = {
    nodo: {
        crear: (nodoData) => ({
            tipo: 'crear_nodo',
            datos: { ...nodoData, timestamp: Date.now() }
        }),
        
        actualizar: (id, cambios) => ({
            tipo: 'actualizar_nodo', 
            datos: { id, ...cambios, timestamp: Date.now() }
        }),
        
        eliminar: (id) => ({
            tipo: 'eliminar_nodo',
            datos: { id, timestamp: Date.now() }
        })
    },

    relacion: {
        crear: (relacionData) => ({
            tipo: 'crear_relacion',
            datos: { ...relacionData, timestamp: Date.now() }
        }),
        
        actualizar: (id, cambios) => ({
            tipo: 'actualizar_relacion',
            datos: { id, ...cambios, timestamp: Date.now() }
        }),
        
        eliminar: (id) => ({
            tipo: 'eliminar_relacion', 
            datos: { id, timestamp: Date.now() }
        })
    }
};

/**
 * Utilidades para trabajar con colaboración
 */
export const ColaboracionUtils = {
    /**
     * Calcula diferencias entre dos estados de diagrama
     */
    calcularDiferencias(estadoAnterior, estadoNuevo) {
        const diferencias = [];
        
        // Comparar nodos
        const nodosAnteriores = estadoAnterior.nodos || [];
        const nodosNuevos = estadoNuevo.nodos || [];
        
        // Nodos agregados
        nodosNuevos.forEach(nodo => {
            if (!nodosAnteriores.find(n => n.id === nodo.id)) {
                diferencias.push({
                    tipo: 'nodo_agregado',
                    elemento: nodo
                });
            }
        });
        
        // Nodos eliminados
        nodosAnteriores.forEach(nodo => {
            if (!nodosNuevos.find(n => n.id === nodo.id)) {
                diferencias.push({
                    tipo: 'nodo_eliminado',
                    elemento: nodo
                });
            }
        });
        
        return diferencias;
    },

    /**
     * Genera un ID único para elementos
     */
    generarId: (prefijo = 'elem') => `${prefijo}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

    /**
     * Formatea información de usuario para mostrar
     */
    formatearUsuario: (usuario) => ({
        id: usuario.id,
        nombre: usuario.nombre || usuario.email?.split('@')[0] || 'Usuario',
        iniciales: (usuario.nombre || usuario.email || 'U').substring(0, 2).toUpperCase(),
        color: usuario.color || `hsl(${usuario.id * 137.5 % 360}, 70%, 50%)`
    })
};

export { colaboracionService, COLABORACION_CONFIG };
export default colaboracionService;