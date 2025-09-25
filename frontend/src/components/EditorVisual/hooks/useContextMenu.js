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

    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
    
    // Si el nodo eliminado estaba siendo editado, cerrar modal
    persistence.setClaseEditando?.(null);
    
    closeContextMenu();
  }, [nodes, edges, saveState, setNodes, setEdges, persistence, closeContextMenu]);

  const editarNodo = useCallback((node) => {
    persistence.setClaseEditando?.(node);
    closeContextMenu();
  }, [persistence, closeContextMenu]);

  // Acciones del menú contextual para relaciones
  const eliminarRelacion = useCallback((relacionId) => {
    saveState(nodes, edges);
    const nuevasEdges = edges.filter((e) => e.id !== relacionId);
    setEdges(nuevasEdges);
    closeContextMenu();
  }, [nodes, edges, saveState, setEdges, closeContextMenu]);

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