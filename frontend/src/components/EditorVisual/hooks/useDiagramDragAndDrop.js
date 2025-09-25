// hooks/useDiagramDragAndDrop.js
import { useCallback, useRef } from 'react';

export const useDiagramDragAndDrop = (editorState, history) => {
  const { nodes, setNodes, edges } = editorState;
  const { saveState } = history;
  
  const reactFlowWrapper = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const lastDropRef = useRef(0);

  const onReactFlowInit = useCallback((instance) => {
    reactFlowInstanceRef.current = instance;
    window.reactFlowInstance = instance;
    window.getReactFlowWrapperRect = () => {
      return reactFlowWrapper.current ? reactFlowWrapper.current.getBoundingClientRect() : { left: 0, top: 0 };
    };
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    
    // Prevenir eventos duplicados
    const now = Date.now();
    if (now - (lastDropRef.current || 0) < 300) {
      console.warn('Evento duplicado detectado, ignorando...');
      return;
    }
    lastDropRef.current = now;

    const tipoNodo = event.dataTransfer.getData('application/reactflow');
    if (!tipoNodo) {
      console.warn('No se pudo obtener el tipo de nodo desde el evento de arrastre.');
      return;
    }

    // Calcular posición corregida
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const scale = reactFlowInstanceRef.current?.zoom || 1;
    const sidebarWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--editor-sidebar-width'), 10) || 0;

    const posicion = {
      x: (event.clientX - bounds.left - sidebarWidth + window.scrollX) / scale,
      y: (event.clientY - bounds.top + window.scrollY) / scale,
    };

    // Guardar estado antes del cambio
    saveState(nodes, edges);

    const nuevoNodo = {
      id: `${tipoNodo}-${Date.now()}`,
      type: tipoNodo,
      position: posicion,
      data: {
        label: `Nueva ${tipoNodo === 'claseNode' ? 'Clase' : 'Interface'}`,
        nombre: `Nueva${tipoNodo === 'claseNode' ? 'Clase' : 'Interface'}`,
        atributos: [],
        metodos: []
      },
    };

    setNodes((nds) => [...nds, nuevoNodo]);
  }, [nodes, edges, saveState, setNodes]);

  return {
    reactFlowWrapper,
    reactFlowInstanceRef,
    onReactFlowInit,
    handleDragOver,
    handleDrop
  };
};