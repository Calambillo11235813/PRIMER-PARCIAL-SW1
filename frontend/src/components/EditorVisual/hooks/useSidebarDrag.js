import { useRef } from 'react';

/**
 * Hook personalizado para gestionar operaciones de drag and drop desde el sidebar
 * Maneja la creación de nuevos nodos y relaciones en el lienzo
 * 
 * @returns {Object} Funciones para manejar el drag and drop del sidebar
 * @property {Function} manejarInicioArrastre - Maneja el inicio del arrastre de elementos del sidebar
 * @property {Function} manejarFinArrastre - Maneja la finalización del arrastre y limpia recursos
 * 
 * @example
 * const { manejarInicioArrastre, manejarFinArrastre } = useSidebarDrag();
 * 
 * <div draggable onDragStart={(e) => manejarInicioArrastre(e, elemento)}>
 *   Elemento arrastrable
 * </div>
 */
export const useSidebarDrag = () => {
  const referenciaImagenDrag = useRef(null);

  /**
   * Crea una imagen transparente para usar durante la operación de drag
   * Esto mejora la experiencia visual eliminando la imagen fantasma
   * 
   * @returns {HTMLCanvasElement|null} Canvas transparente o null en caso de error
   */
  const crearImagenTransparente = () => {
    try {
      const lienzo = document.createElement('canvas');
      lienzo.width = 1;
      lienzo.height = 1;
      const contexto = lienzo.getContext('2d');
      contexto.clearRect(0, 0, 1, 1);
      lienzo.style.position = 'absolute';
      lienzo.style.top = '-9999px';
      lienzo.style.left = '-9999px';
      document.body.appendChild(lienzo);
      return lienzo;
    } catch (error) {
      console.warn('Error creando imagen transparente para drag:', error);
      return null;
    }
  };

  /**
   * Maneja el inicio del arrastre de un elemento del sidebar
   * Configura los datos de transferencia y la imagen de drag
   * 
   * @param {DragEvent} evento - Evento de drag nativo
   * @param {Object} elemento - Elemento que se está arrastrando
   * @param {string} elemento.type - Tipo de nodo/relación (ej: 'claseNode', 'relacion-asociacion')
   * @param {string} elemento.id - Identificador único del elemento
   */
  const manejarInicioArrastre = (evento, elemento) => {
    if (!elemento || !elemento.type) {
      console.warn('Sidebar - Elemento inválido en arrastre:', elemento);
      return;
    }

    console.debug('Sidebar - Iniciando arrastre de elemento:', elemento);

    try {
      const imagen = crearImagenTransparente();
      if (imagen && typeof evento.dataTransfer.setDragImage === 'function') {
        evento.dataTransfer.setDragImage(imagen, 0, 0);
        referenciaImagenDrag.current = imagen;
      }
    } catch (error) {
      // Fallback silencioso para navegadores que no soportan setDragImage
    }

    try {
      // Establecer datos de transferencia para React Flow
      evento.dataTransfer.setData('application/reactflow', elemento.type);
      evento.dataTransfer.setData('nodeType', elemento.type);
      evento.dataTransfer.setData('text/plain', elemento.type);
      
      // Datos adicionales para nuestro sistema
      evento.dataTransfer.setData('elementoId', elemento.id);
      evento.dataTransfer.setData('elementoTipo', elemento.type);
    } catch (error) {
      console.warn('Error estableciendo datos de transferencia:', error);
    }
    
    evento.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Maneja el final del arrastre y limpia los recursos utilizados
   * Elimina la imagen transparente del DOM
   */
  const manejarFinArrastre = () => {
    try {
      const imagen = referenciaImagenDrag.current;
      if (imagen?.parentNode) {
        imagen.parentNode.removeChild(imagen);
      }
      referenciaImagenDrag.current = null;
    } catch (error) {
      console.warn('Error limpiando imagen de drag:', error);
      referenciaImagenDrag.current = null;
    }
  };

  return {
    manejarInicioArrastre,
    manejarFinArrastre
  };
};