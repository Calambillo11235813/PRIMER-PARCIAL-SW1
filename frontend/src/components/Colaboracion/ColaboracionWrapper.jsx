import React, { useEffect, useCallback, useMemo } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { CambioService } from './hooks/useWebSocket';
import colaboracionService, { EVENTOS_COLABORACION, CreadorDeCambios } from './services/colaboracionService';
import IndicadoresColaboracion from './IndicadoresColaboracion';

/**
 * Wrapper que maneja toda la lógica de colaboración para el editor
 * Se integra de forma transparente sin modificar mucho el EditorDiagrama
 */
const ColaboracionWrapper = ({ 
  diagramaId, 
  editorState, 
  history, 
  persistence, 
  children 
}) => {
  // Hook de WebSocket
  const {
    estaConectado,
    usuariosConectados,
    usuariosEditando,
    ultimoCambio,
    errores,
    enviarCambio,
    sincronizarEstado,
    notificarEdicion
  } = useWebSocket(diagramaId);

  // Obtener ID del usuario actual
  const usuarioActualId = useMemo(() => {
    return localStorage.getItem('user_id');
  }, []);

  /**
   * Aplicar cambios recibidos de otros usuarios
   */
  const aplicarCambioRemoto = useCallback((cambioData) => {
    if (!cambioData || !cambioData.cambio) return;

    const { cambio, usuario_id } = cambioData;
    
    // No aplicar nuestros propios cambios
    if (usuario_id === usuarioActualId) return;

    console.log('Aplicando cambio remoto:', cambio, 'de usuario:', usuario_id);

    // Procesar cambio usando el servicio de colaboración
    const estadoActual = {
      nodos: editorState.nodes,
      relaciones: editorState.edges
    };

    const nuevoEstado = colaboracionService.procesarCambioRecibido(
      cambioData, 
      estadoActual
    );

    if (!nuevoEstado) {
      console.warn('No se pudo aplicar el cambio remoto');
      return;
    }

    // Aplicar cambios al estado del editor
    if (nuevoEstado.nodos && Array.isArray(nuevoEstado.nodos)) {
      editorState.setNodes(nuevoEstado.nodos);
    }
    if (nuevoEstado.relaciones && Array.isArray(nuevoEstado.relaciones)) {
      editorState.setEdges(nuevoEstado.relaciones);
    }

  }, [editorState, usuarioActualId]);

  /**
   * Enviar cambio cuando el estado local cambia
   */
  const manejarCambioLocal = useCallback((tipo, datos) => {
    if (!estaConectado) {
      console.log('No conectado, cambio no enviado:', tipo);
      return;
    }

    let cambio;
    
    try {
      switch (tipo) {
        case 'nodos_actualizados':
          // Solo enviar si hubo cambios reales
          if (datos.cambios && datos.cambios.length > 0) {
            datos.cambios.forEach(cambioNodo => {
              if (cambioNodo.type === 'position' && !cambioNodo.dragging) {
                // Posición final de nodo
                cambio = CreadorDeCambios.nodo.actualizar(
                  cambioNodo.id, 
                  { position: cambioNodo.position }
                );
                enviarCambio(cambio);
                console.log('Enviado cambio de posición:', cambioNodo.id);
              }
            });
          }
          break;
          
        case 'nodo_agregado':
          cambio = CreadorDeCambios.nodo.crear(datos);
          enviarCambio(cambio);
          console.log('Enviado nodo agregado:', datos.id);
          break;
          
        case 'nodo_eliminado':
          cambio = CreadorDeCambios.nodo.eliminar(datos.id);
          enviarCambio(cambio);
          console.log('Enviado nodo eliminado:', datos.id);
          break;
          
        case 'relacion_agregada':
          cambio = CreadorDeCambios.relacion.crear(datos);
          enviarCambio(cambio);
          console.log('Enviada relación agregada:', datos.id);
          break;
          
        case 'relacion_eliminada':
          cambio = CreadorDeCambios.relacion.eliminar(datos.id);
          enviarCambio(cambio);
          console.log('Enviada relación eliminada:', datos.id);
          break;

        default:
          console.log('Tipo de cambio no manejado:', tipo);
      }
    } catch (error) {
      console.error('Error enviando cambio:', error);
    }
  }, [estaConectado, enviarCambio]);

  /**
   * Interceptar cambios en nodos para colaboración
   */
  const onNodesChangeColaborativo = useCallback((cambios) => {
    // Aplicar cambios normalmente
    editorState.onNodesChange(cambios);
    
    // Enviar cambios relevantes con debounce
    const cambiosRelevantes = cambios.filter(c => 
      c.type === 'position' || c.type === 'add' || c.type === 'remove'
    );
    
    if (cambiosRelevantes.length > 0) {
      setTimeout(() => {
        manejarCambioLocal('nodos_actualizados', { cambios: cambiosRelevantes });
      }, 100); // Pequeño delay para agrupar cambios
    }
  }, [editorState.onNodesChange, manejarCambioLocal]);

  /**
   * Interceptar cambios en edges para colaboración
   */
  const onEdgesChangeColaborativo = useCallback((cambios) => {
    // Aplicar cambios normalmente
    editorState.onEdgesChange(cambios);
    
    // Procesar cambios para colaboración
    cambios.forEach(cambio => {
      if (cambio.type === 'remove') {
        manejarCambioLocal('relacion_eliminada', { id: cambio.id });
      }
    });
  }, [editorState.onEdgesChange, manejarCambioLocal]);

  /**
   * Interceptar agregado de conexiones
   */
  const onConnectColaborativo = useCallback((params) => {
    // Ejecutar lógica normal de conexión
    const resultado = editorState.onConnect?.(params);
    
    // Enviar nueva relación
    if (params) {
      const nuevaRelacion = {
        id: `edge-${Date.now()}`,
        ...params
      };
      manejarCambioLocal('relacion_agregada', nuevaRelacion);
    }
    
    return resultado;
  }, [editorState.onConnect, manejarCambioLocal]);

  // Aplicar cambios remotos cuando llegan
  useEffect(() => {
    if (ultimoCambio) {
      aplicarCambioRemoto(ultimoCambio);
    }
  }, [ultimoCambio, aplicarCambioRemoto]);

  // Escuchar eventos del servicio de colaboración
  useEffect(() => {
    const unsubscribeConflicto = colaboracionService.on(
      EVENTOS_COLABORACION.CONFLICTO_DETECTADO,
      (data) => {
        console.warn('Conflicto detectado:', data);
        // Mostrar notificación de conflicto
        if (persistence.mostrarNotificacion) {
          persistence.mostrarNotificacion(
            'Se detectó un conflicto. Los cambios se sincronizarán automáticamente.', 
            'warning'
          );
        }
      }
    );

    const unsubscribeNotificacion = colaboracionService.on(
      EVENTOS_COLABORACION.NOTIFICACION_CREADA,
      (notificacion) => {
        // Integrar con el sistema de notificaciones existente
        if (persistence.mostrarNotificacion) {
          persistence.mostrarNotificacion(notificacion.mensaje, notificacion.tipo);
        }
      }
    );

    return () => {
      unsubscribeConflicto();
      unsubscribeNotificacion();
    };
  }, [persistence]);

  // Sincronización periódica
  useEffect(() => {
    if (estaConectado) {
      const interval = setInterval(() => {
        sincronizarEstado();
      }, 30000); // Cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [estaConectado, sincronizarEstado]);

  // Propiedades mejoradas para el editor
  const editorStateColaborativo = useMemo(() => ({
    ...editorState,
    onNodesChange: onNodesChangeColaborativo,
    onEdgesChange: onEdgesChangeColaborativo,
    onConnect: onConnectColaborativo
  }), [editorState, onNodesChangeColaborativo, onEdgesChangeColaborativo, onConnectColaborativo]);

  return (
    <div className="colaboracion-wrapper relative">
      {/* Indicadores de colaboración */}
      <IndicadoresColaboracion
        usuariosConectados={usuariosConectados}
        estaConectado={estaConectado}
        usuariosEditando={usuariosEditando}
      />
      
      {/* Renderizar children con estado colaborativo */}
      {React.cloneElement(children, {
        editorState: editorStateColaborativo,
        colaboracion: {
          estaConectado,
          usuariosConectados,
          usuariosEditando,
          notificarEdicion
        }
      })}
      
      {/* Notificaciones de errores de colaboración */}
      {errores.length > 0 && (
        <div className="fixed bottom-4 left-4 space-y-2 z-50">
          {errores.slice(-2).map((error, index) => (
            <div key={index} className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-lg shadow-md max-w-sm">
              <p className="text-sm font-medium">Colaboración:</p>
              <p className="text-sm">{error.mensaje}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColaboracionWrapper;