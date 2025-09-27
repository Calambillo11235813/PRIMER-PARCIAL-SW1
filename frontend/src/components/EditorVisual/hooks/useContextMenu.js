// hooks/useContextMenu.js
import { useState, useRef, useEffect, useCallback } from 'react';

export const useContextMenu = (editorState, history, edgeManagement, persistence) => {
  const { nodes, setNodes, edges, setEdges } = editorState;
  const { saveState } = history;
  const { handleEditarRelacion } = edgeManagement;

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    node: null,
    edge: null
  });

  const contextMenuRef = useRef(contextMenu);

  // Sincronizar ref con estado
  useEffect(() => {
    contextMenuRef.current = contextMenu;
  }, [contextMenu]);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, node: null, edge: null });
  }, []);

  // Handlers para nodos
  const handleNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    event.stopPropagation();

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      node,
      edge: null,
    });
  }, []);

  // Handlers para relaciones
  const handleEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    event.stopPropagation();

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      node: null,
      edge,
    });
  }, []);

  // Acciones del menú contextual para nodos
  const copiarNodo = useCallback((node) => {
    saveState(nodes, edges);

    const newId = `n_${Date.now()}`;
    const offset = 24;
    const cloned = {
      id: newId,
      type: node.type,
      position: { x: node.position.x + offset, y: node.position.y + offset },
      data: JSON.parse(JSON.stringify(node.data)),
    };

    setNodes((nds) => nds.concat(cloned));
    closeContextMenu();
  }, [nodes, edges, saveState, setNodes, closeContextMenu]);

  const eliminarNodoMenu = useCallback((node) => {
    saveState(nodes, edges);

    // Actualiza nodes/edges usando la versión funcional y persiste con la snapshot resultante
    setNodes((ndsPrev) => {
      const nuevasNodes = ndsPrev.filter((n) => n.id !== node.id);
      // También actualizamos edges aquí, así que devolvemos nodes y manejamos persistir por setEdges
      // Persisteremos tras actualizar edges (en setEdges callback).
      // Guardamos snapshot provisional (sin relaciones asociadas aún)
      return nuevasNodes;
    });

    // Actualizamos edges y persistimos — importante usar la versión funcional para obtener el valor correcto
    setEdges((edsPrev) => {
      const nuevasEdges = edsPrev.filter((e) => e.source !== node.id && e.target !== node.id);

      // Construir la estructura lista para persistir
      const nodosParaPersistir = (typeof editorState.nodes === 'function'
        ? editorState.nodes // raro caso, pero en general tomamos la referencia actual abajo
        : editorState.nodes
      ).filter(n => n.id !== node.id).map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      }));

      const relacionesParaPersistir = nuevasEdges.map(e => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle,
        tipo: e.data?.tipo,
        multiplicidadSource: e.data?.multiplicidadSource,
        multiplicidadTarget: e.data?.multiplicidadTarget,
        label: e.data?.label,
      }));

      // Llamada a persistir (no bloqueante)
      persistence.persistirDiagrama({
        nodos: nodosParaPersistir,
        relaciones: relacionesParaPersistir
      }).catch(err => {
        console.error('Error al persistir eliminación de nodo:', err);
        // Opcional: revertir cambios o notificar al usuario
      });

      // Limpiar edición de clase si aplica
      persistence.setClaseEditando?.(null);
      closeContextMenu();

      return nuevasEdges;
    });

  }, [nodes, edges, saveState, setNodes, setEdges, persistence, editorState.nodes, closeContextMenu]);

  const editarNodo = useCallback((node) => {
    persistence.setClaseEditando?.(node);
    closeContextMenu();
  }, [persistence, closeContextMenu]);

  // Acciones del menú contextual para relaciones
  const eliminarRelacion = useCallback((relacionId) => {
    saveState(nodes, edges);

    setEdges((edsPrev) => {
      const nuevasEdges = edsPrev.filter((e) => e.id !== relacionId);

      const nodosParaPersistir = editorState.nodes.map(n => ({
        id: n.id, type: n.type, position: n.position, data: n.data
      }));

      const relacionesParaPersistir = nuevasEdges.map(e => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle,
        tipo: e.data?.tipo,
        multiplicidadSource: e.data?.multiplicidadSource,
        multiplicidadTarget: e.data?.multiplicidadTarget,
        label: e.data?.label,
      }));

      persistence.persistirDiagrama({
        nodos: nodosParaPersistir,
        relaciones: relacionesParaPersistir
      }).catch(err => {
        console.error('Error al persistir eliminación de relación:', err);
        // Opcional: revertir o notificar
      });

      closeContextMenu();
      return nuevasEdges;
    });
  }, [nodes, edges, saveState, setEdges, persistence, editorState.nodes, closeContextMenu]);

  const editarRelacion = useCallback((relacion) => {
    handleEditarRelacion(relacion);
    closeContextMenu();
  }, [handleEditarRelacion, closeContextMenu]);

  const cambiarEstiloRelacion = useCallback((relacionId, layout) => {
    saveState(nodes, edges);

    setEdges((currentEdges) =>
      currentEdges.map((e) => {
        if (e.id !== relacionId) return e;

        const newData = { ...e.data, layout };
        if (layout === 'straight' && newData.points) {
          delete newData.points;
        }
        return { ...e, data: newData };
      })
    );

    closeContextMenu();
  }, [nodes, edges, saveState, setEdges, closeContextMenu]);

  return {
    contextMenu,
    setContextMenu,
    closeContextMenu,
    handleNodeContextMenu,
    handleEdgeContextMenu,
    accionesContextMenu: {
      copiarNodo,
      eliminarNodoMenu,
      editarNodo,
      eliminarRelacion,
      editarRelacion,
      cambiarEstiloRelacion
    }
  };
};