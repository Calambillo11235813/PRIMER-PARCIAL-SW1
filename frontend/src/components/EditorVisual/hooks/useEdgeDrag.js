import { useCallback, useState } from 'react';

/**
 * Hook para drag & drop de puntos de relaciones UML existentes en el lienzo
 * Maneja la modificación de edges ya creados (endpoints y handles intermedios)
 * 
 * @param {string} id - ID único de la relación que se está editando
 * @param {React.MutableRefObject} referenciaPuntosLocales - Referencia a los puntos actuales de la relación
 * @param {Function} actualizarPuntos - Función para actualizar el estado de puntos
 * 
 * @returns {Object} Estado y funciones para el drag de edges
 * @property {number|null} hoverHandle - Índice del handle bajo el cursor
 * @property {number|null} draggingHandle - Índice del handle siendo arrastrado
 * @property {Function} setHoverHandle - Establece el handle bajo el cursor
 * @property {Function} setDraggingHandle - Establece el handle siendo arrastrado
 * @property {Function} manejarInicioArrastreEndpoint - Maneja arrastre de endpoints (inicio/fin)
 * @property {Function} manejarInicioArrastreHandle - Maneja arrastre de handles intermedios
 * 
 * @example
 * const { 
 *   hoverHandle, 
 *   draggingHandle, 
 *   manejarInicioArrastreEndpoint,
 *   manejarInicioArrastreHandle 
 * } = useEdgeDrag(id, referenciaPuntos, actualizarPuntos);
 */
export const useEdgeDrag = (id, referenciaPuntosLocales, actualizarPuntos) => {
  const [hoverHandle, setHoverHandle] = useState(null);
  const [draggingHandle, setDraggingHandle] = useState(null);

  /**
   * Emite un evento personalizado cuando cambia un endpoint de la relación
   * 
   * @param {string} cual - Tipo de endpoint ('source' o 'target')
   * @param {Object} puntoProyectado - Coordenadas {x, y} del punto proyectado
   * @param {number|null} clientX - Coordenada X del cliente (opcional)
   * @param {number|null} clientY - Coordenada Y del cliente (opcional)
   */
  const emitirCambioEndpoint = useCallback((cual, puntoProyectado, clientX = null, clientY = null) => {
    try {
      const detalle = { 
        id, 
        cual, 
        punto: puntoProyectado, 
        clientX, 
        clientY 
      };
      window.dispatchEvent(new CustomEvent('edge-endpoint-change', { detail: detalle }));
    } catch (error) {
      console.warn('[RelacionNode] Error emitiendo cambio de endpoint:', error);
    }
  }, [id]);

  /**
   * Emite un evento personalizado cuando cambian todos los puntos de la relación
   * 
   * @param {Array} puntos - Array de puntos {x, y} actualizados
   */
  const emitirCambioPuntos = useCallback((puntos) => {
    try {
      window.dispatchEvent(new CustomEvent('edge-points-change', { 
        detail: { id, puntos } 
      }));
    } catch (error) {
      console.warn('[RelacionNode] Error emitiendo cambio de puntos:', error);
    }
  }, [id]);

  /**
   * Maneja el inicio de arrastre de un endpoint (inicio o fin de la relación)
   * 
   * @param {string} cual - Tipo de endpoint ('source' o 'target')
   * @param {number} indice - Índice del punto en el array
   * @returns {Function} Función manejadora del evento
   */
  const manejarInicioArrastreEndpoint = useCallback((cual, indice) => (evento) => {
    evento.stopPropagation?.();
    evento.preventDefault?.();

    const inicioClientX = evento.clientX || 0;
    const inicioClientY = evento.clientY || 0;
    let seMovio = false;
    const tiempoInicio = Date.now();

    /**
     * Maneja el movimiento durante el arrastre
     */
    const alMover = (eventoMover) => {
      seMovio = true;
      const proyectado = { 
        x: eventoMover.clientX, 
        y: eventoMover.clientY 
      };
      
      window.dispatchEvent(new CustomEvent('edge-drag-move', {
        detail: { 
          id, 
          cual, 
          indice, 
          punto: proyectado, 
          clientX: eventoMover.clientX, 
          clientY: eventoMover.clientY 
        }
      }));
    };

    /**
     * Maneja la finalización del arrastre
     */
    const alSoltar = (eventoSoltar) => {
      const clientXFinal = eventoSoltar.clientX || inicioClientX;
      const clientYFinal = eventoSoltar.clientY || inicioClientY;
      const diferenciaTiempo = Date.now() - tiempoInicio;

      // Si fue un click rápido (sin movimiento), interpretar como selección
      if (!seMovio && diferenciaTiempo < 300) {
        window.dispatchEvent(new CustomEvent('edge-select-for-handle-assign', { 
          detail: { id, cual } 
        }));
      } else {
        // Si hubo movimiento, emitir cambio de endpoint
        emitirCambioEndpoint(cual, { x: clientXFinal, y: clientYFinal }, clientXFinal, clientYFinal);
      }

      // Limpiar event listeners
      window.removeEventListener('pointermove', alMover);
      window.removeEventListener('pointerup', alSoltar);
    };

    // Registrar event listeners
    window.addEventListener('pointermove', alMover);
    window.addEventListener('pointerup', alSoltar);
  }, [id, emitirCambioEndpoint]);

  /**
   * Maneja el inicio de arrastre de un handle intermedio de la relación
   * 
   * @param {number} indice - Índice del handle en el array de puntos
   * @returns {Function} Función manejadora del evento
   */
  const manejarInicioArrastreHandle = useCallback((indice) => (evento) => {
    evento.preventDefault?.();
    evento.stopPropagation?.();
    setDraggingHandle(indice);

    // Obtener dimensiones del contenedor React Flow
    const rect = (window.getReactFlowWrapperRect && window.getReactFlowWrapperRect()) || { left: 0, top: 0 };
    const inicioClientX = evento.clientX || 0;
    const inicioClientY = evento.clientY || 0;
    
    // Convertir coordenadas de cliente a relativas al contenedor
    const relInicioX = inicioClientX - rect.left;
    const relInicioY = inicioClientY - rect.top;

    // Proyectar coordenadas al sistema de React Flow
    const inicioProyectado = window.reactFlowInstance?.project?.({ x: relInicioX, y: relInicioY }) || { x: relInicioX, y: relInicioY };
    const puntoActual = referenciaPuntosLocales.current[indice] || inicioProyectado;
    
    // Calcular offset para evitar salto inicial
    const offsetX = puntoActual.x - inicioProyectado.x;
    const offsetY = puntoActual.y - inicioProyectado.y;

    /**
     * Maneja el movimiento del handle durante el arrastre
     */
    const alMover = (eventoMover) => {
      const clientX = eventoMover.clientX || 0;
      const clientY = eventoMover.clientY || 0;
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      // Proyectar y calcular nueva posición
      const proyectado = window.reactFlowInstance?.project?.({ x: relX, y: relY }) || { x: relX, y: relY };
      const objetivoX = Math.round(proyectado.x + offsetX);
      const objetivoY = Math.round(proyectado.y + offsetY);

      // Actualizar puntos
      actualizarPuntos(prev => {
        const siguiente = [...prev];
        siguiente[indice] = { x: objetivoX, y: objetivoY };
        return siguiente;
      });
    };

    /**
     * Maneja la finalización del arrastre del handle
     */
    const alSoltar = () => {
      window.removeEventListener('pointermove', alMover);
      window.removeEventListener('pointerup', alSoltar);
      setDraggingHandle(null);
      emitirCambioPuntos(referenciaPuntosLocales.current);
    };

    // Registrar event listeners
    window.addEventListener('pointermove', alMover);
    window.addEventListener('pointerup', alSoltar);
  }, [referenciaPuntosLocales, actualizarPuntos, emitirCambioPuntos]);

  return {
    hoverHandle,
    draggingHandle,
    setHoverHandle,
    setDraggingHandle,
    manejarInicioArrastreEndpoint,
    manejarInicioArrastreHandle
  };
};