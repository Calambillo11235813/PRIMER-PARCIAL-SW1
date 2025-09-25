// hooks/useEdgeManagement.js
import { useCallback, useState, useEffect, useMemo } from 'react';
import RelacionNode from '../RelacionNode';
import { addEdge } from '@xyflow/react';
import * as SmartEdgeModule from '@tisoap/react-flow-smart-edge';

// Resolver importación de SmartEdge
const SmartEdgeResolved =
  SmartEdgeModule?.SmartEdge ||
  SmartEdgeModule?.default ||
  SmartEdgeModule;

export const useEdgeManagement = (editorState, history, persistence) => {
  const { nodes, edges, setEdges } = editorState;
  const { saveState } = history;
  const { serializarEstructura, persistirDiagrama } = persistence;

  const [relacionEditando, setRelacionEditando] = useState(null);
  const [modalRelacionAbierto, setModalRelacionAbierto] = useState(false);
  const [assignPending, setAssignPending] = useState(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);

  // Detectar si SmartEdge está disponible
  const isSmartEdgeComponent = useMemo(() => {
    if (!SmartEdgeResolved) return false;
    return (
      typeof SmartEdgeResolved === 'function' ||
      !!SmartEdgeResolved?.$$typeof ||
      !!SmartEdgeResolved?.render
    );
  }, []);

  const smartTypeName = useMemo(
    () => (isSmartEdgeComponent ? 'smart' : 'relacionNode'),
    [isSmartEdgeComponent]
  );

  // Tipos de aristas configurados
  const edgeTypes = useMemo(
    () => ({
      relacionNode: RelacionNode,
    }),
    []
  );

  const connectionLineTypeProp = isSmartEdgeComponent ? 'smart' : 'straight';

  // Handler para crear conexiones
  const onConnect = useCallback(
    (params) => {
      console.log('useEdgeManagement - Intentando crear edge:', params);
      if (!params.sourceHandle || !params.targetHandle) {
        console.warn(
          'Intento de crear edge con handle nulo. Edge no creado.',
          params
        );
        return;
      }

      saveState(nodes, edges);

      const nuevaRelacion = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'relacionNode', // ← Forzado a tu componente personalizado
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        data: {
          tipo: 'asociacion',
          multiplicidadSource: '1',
          multiplicidadTarget: 'N',
        },
      };

      setEdges((eds) => addEdge(nuevaRelacion, eds));
    },
    [nodes, edges, saveState, smartTypeName, setEdges]
  );

  // Handler para editar relaciones
  const handleEditarRelacion = useCallback((relacion) => {
    setRelacionEditando(relacion);
    setModalRelacionAbierto(true);
  }, []);

  // Handler para guardar relaciones
  const handleGuardarRelacion = useCallback(
    (relacionActualizada) => {
      saveState(nodes, edges);

      setEdges((eds) =>
        eds.map((e) =>
          e.id === relacionActualizada.id
            ? { ...e, data: { ...e.data, ...relacionActualizada.data } }
            : e
        )
      );

      setModalRelacionAbierto(false);
      setRelacionEditando(null);

      // Eliminar la línea que causa el error
      // const estructuraSnapshot = serializarEstructura();
      // persistirDiagrama(estructuraSnapshot);
    },
    [nodes, edges, saveState, setEdges, serializarEstructura, persistirDiagrama]
  );

  // Manejo de endpoints de relaciones
  useEffect(() => {
    const handler = (ev) => {
      const { id: edgeId, which, point } = ev.detail || {};
      if (!edgeId || !which || !point) return;

      // Aquí iría la lógica de reasignación de endpoints
    };

    window.addEventListener('edge-endpoint-change', handler);
    return () => window.removeEventListener('edge-endpoint-change', handler);
  }, [nodes, setEdges]);

  // Manejo de selección rápida para asignación de handles
  useEffect(() => {
    const handler = (ev) => {
      const detail = ev.detail || {};
      const edgeId = detail.id;
      const which = detail.which;
      if (!edgeId || !which) return;

      setAssignPending({ edgeId, which });
    };

    window.addEventListener('edge-select-for-handle-assign', handler);
    return () =>
      window.removeEventListener('edge-select-for-handle-assign', handler);
  }, []);

  // Helper para calcular handles
  const pickHandleForNode = useCallback((node, x, y, which) => {
    const nw = node.position.x;
    const nh = node.position.y;
    const w = node.width || 180;
    const h = node.height || 120;
    const cx = nw + w / 2;
    const cy = nh + h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    let side =
      horizontal ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'bottom' : 'top';

    let idx = 1;
    if (side === 'left' || side === 'right') {
      const rel = (y - nh) / h;
      idx = Math.min(4, Math.max(1, Math.ceil(rel * 4)));
    } else {
      const rel = (x - nw) / w;
      idx = Math.min(4, Math.max(1, Math.ceil(rel * 4)));
    }

    const typePart = which === 'source' ? 'src' : 'tgt';
    return `${node.id}-${side}-${typePart}-${idx}`;
  }, []);

  return {
    relacionEditando,
    setRelacionEditando, // ← Agrega esto
    modalRelacionAbierto,
    setModalRelacionAbierto,
    edgeTypes,
    connectionLineTypeProp,
    onConnect,
    handleEditarRelacion,
    handleGuardarRelacion,
    pickHandleForNode,
    assignPending,
    setAssignPending,
    highlightedNodeId,
    setHighlightedNodeId,
  };
};
