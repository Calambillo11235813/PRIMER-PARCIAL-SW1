import { useCallback } from 'react';

/**
 * Hook para calcular la posición exacta de los handles basado en sus IDs
 */
export const useHandlePosition = (sourceHandleId, targetHandleId, sourceX, sourceY, targetX, targetY) => {
  // Calcular posición basada en el handle
  const getHandlePosition = useCallback((handleId, baseX, baseY) => {
    if (!handleId) return { x: baseX, y: baseY };
    
    // Extraer información del handle ID (ej: "claseNode-1758-right-tgt-35")
    const parts = handleId.split('-');
    const position = parts[2]; // "right", "left", "top", "bottom"
    const offset = parseInt(parts[parts.length - 1]); // 15, 35, 65, 85
    
    // Ajustar según la posición del handle
    const nodeWidth = 180; // Ancho aproximado del nodo
    const nodeHeight = 220; // Alto aproximado del nodo
    
    switch (position) {
      case 'right':
        return { 
          x: baseX + (nodeWidth / 2), 
          y: baseY - (nodeHeight / 2) + (offset * nodeHeight / 100) 
        };
      case 'left':
        return { 
          x: baseX - (nodeWidth / 2), 
          y: baseY - (nodeHeight / 2) + (offset * nodeHeight / 100) 
        };
      case 'top':
        return { 
          x: baseX - (nodeWidth / 2) + (offset * nodeWidth / 100), 
          y: baseY - (nodeHeight / 2) 
        };
      case 'bottom':
        return { 
          x: baseX - (nodeWidth / 2) + (offset * nodeWidth / 100), 
          y: baseY + (nodeHeight / 2) 
        };
      default:
        return { x: baseX, y: baseY };
    }
  }, []);

  // Obtener posición real del handle source
  const handleSourcePos = getHandlePosition(sourceHandleId, sourceX, sourceY);
  const handleTargetPos = getHandlePosition(targetHandleId, targetX, targetY);

  // Helper para obtener puntos renderizados
  const getRenderedPoint = useCallback((p, i, len) => {
    if (i === 0) return { 
      x: Math.round(handleSourcePos.x), 
      y: Math.round(handleSourcePos.y) 
    };
    if (i === len - 1) return { 
      x: Math.round(handleTargetPos.x), 
      y: Math.round(handleTargetPos.y) 
    };
    return p;
  }, [handleSourcePos, handleTargetPos]);

  return {
    handleSourcePos,
    handleTargetPos,
    getRenderedPoint
  };
};

/**
 * Función utilitaria para calcular la posición de un handle
 */
export function getHandlePosition(handleId, baseX, baseY, nodeWidth = 180, nodeHeight = 220) {
  if (!handleId) return { x: baseX, y: baseY };

  const parts = handleId.split('-');
  const position = parts[2]; // "right", "left", "top", "bottom"
  const offset = parseInt(parts[parts.length - 1]); // 15, 35, 65, 85

  switch (position) {
    case 'right':
      return { 
        x: baseX + (nodeWidth / 2), 
        y: baseY - (nodeHeight / 2) + (offset * nodeHeight / 100) 
      };
    case 'left':
      return { 
        x: baseX - (nodeWidth / 2), 
        y: baseY - (nodeHeight / 2) + (offset * nodeHeight / 100) 
      };
    case 'top':
      return { 
        x: baseX - (nodeWidth / 2) + (offset * nodeWidth / 100), 
        y: baseY - (nodeHeight / 2) 
      };
    case 'bottom':
      return { 
        x: baseX - (nodeWidth / 2) + (offset * nodeWidth / 100), 
        y: baseY + (nodeHeight / 2) 
      };
    default:
      return { x: baseX, y: baseY };
  }
}