import { useRef } from 'react';

/**
 * Hook para drag & drop de conexiones entre nodos (React Flow)
 * Captura el id del handle de origen y destino para crear edges válidos.
 */
export const useNodeEdgeDrag = () => {
  const sourceNodeIdRef = useRef(null);
  const sourceHandleIdRef = useRef(null);

  /**
   * Llamar al iniciar el drag desde un handle de origen
   */
  const iniciarDragDesdeHandle = (nodeId, handleId) => {
    sourceNodeIdRef.current = nodeId;
    sourceHandleIdRef.current = handleId;
  };

  /**
   * Llamar al soltar el drag sobre un handle de destino
   * Devuelve los datos necesarios para crear el edge
   */
  const finalizarDragEnHandle = (targetNodeId, targetHandleId) => {
    // Validar que los IDs no sean null ni undefined
    if (
      !sourceNodeIdRef.current ||
      !sourceHandleIdRef.current ||
      !targetNodeId ||
      !targetHandleId
    ) return null;
    const edge = {
      source: sourceNodeIdRef.current,
      sourceHandle: sourceHandleIdRef.current,
      target: targetNodeId,
      targetHandle: targetHandleId,
      id: `edge-${sourceNodeIdRef.current}-${targetNodeId}-${Date.now()}`
    };
    // Limpiar refs
    sourceNodeIdRef.current = null;
    sourceHandleIdRef.current = null;
    return edge;
  };

  return {
    iniciarDragDesdeHandle,
    finalizarDragEnHandle
  };
};