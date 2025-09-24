import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { ReactFlow, addEdge, useEdgesState, useNodesState, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ClaseNodeRF from './ClaseNodeRF.jsx';
import RelacionNode from './RelacionNode.jsx';
import EditarClaseModal from './EditarClaseModal';
import { crearDiagrama, actualizarDiagrama } from '../../services/diagramService';
import ContextMenu from './ContextMenu';
import EditarRelacionModal from './EditarRelacionModal';
// Intentar resolver export del paquete @tisoap/react-flow-smart-edge de forma robusta
import * as SmartEdgeModule from '@tisoap/react-flow-smart-edge';
// Puede exportar named SmartEdge, default o ser un objeto; elegir lo disponible.
const SmartEdgeResolved = SmartEdgeModule?.SmartEdge || SmartEdgeModule?.default || SmartEdgeModule;
console.debug && console.debug('[EditorDiagrama] SmartEdgeModule keys:', Object.keys(SmartEdgeModule || {}), 'resolved:', SmartEdgeResolved);


// Hook personalizado para manejar el historial
const useDiagramHistory = () => {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const saveState = (nodes, edges) => {
    if (nodes && edges) {
      setPast(prev => [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
      setFuture([]);
    }
  };

  const undo = (currentNodes, currentEdges) => {
    if (past.length === 0) return null;

    const previousState = past[past.length - 1];
    setFuture(prev => [{ nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)) }, ...prev]);
    setPast(prev => prev.slice(0, -1));

    return previousState;
  };

  const redo = () => {
    if (future.length === 0) return null;

    const nextState = future[0];
    setPast(prev => [...prev, nextState]);
    setFuture(prev => prev.slice(1));

    return nextState;
  };

  return {
    past,
    future,
    saveState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
};

const EditorDiagrama = ({ estructuraInicial, onGuardar, projectId = null, diagramaId = null }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [claseEditando, setClaseEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ref del wrapper del canvas y referencia a reactFlowInstance
  const reactFlowWrapper = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const lastDropRef = useRef(0);

  const onReactFlowInit = (instance) => {
    reactFlowInstanceRef.current = instance;
    // Exponer globalmente para que los edges puedan proyectar coordenadas
    window.reactFlowInstance = instance;
    window.getReactFlowWrapperRect = () => {
      return reactFlowWrapper.current ? reactFlowWrapper.current.getBoundingClientRect() : { left: 0, top: 0 };
    };
    console.debug && console.debug('[EditorDiagrama] onInit reactFlow instance set');
  };

  // Estados para el manejo de relaciones
  const [relacionEditando, setRelacionEditando] = useState(null);
  const [modalRelacionAbierto, setModalRelacionAbierto] = useState(false);

  // Función para editar relación (AGREGA ESTA FUNCIÓN)
  const handleEditarRelacion = (relacion) => {

    setRelacionEditando(relacion);
    setModalRelacionAbierto(true);
  };

  // Funcion para guardar relacion editada 

  const handleGuardarRelacion = (relacionActualizada) => {
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

    // Persistir cambios
    const estructuraSnapshot = serializarEstructura();
    persistDiagrama(estructuraSnapshot);
  };





  // Context menu state
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, node: null, edge: null });

  // Ref sincronizado para inspección inmediata (debug)
  const contextMenuRef = useRef(contextMenu);
  useEffect(() => {
    contextMenuRef.current = contextMenu;
  }, [contextMenu]);



  // DEBUG: log del estado del context menu para verificar payloads
  useEffect(() => {
    try {
      // Copia segura para evitar circular refs en el log
      console.debug('[EditorDiagrama] contextMenu changed:', JSON.parse(JSON.stringify(contextMenu)));
    } catch (err) {
      console.debug('[EditorDiagrama] contextMenu changed (non-serializable):', contextMenu);
    }
  }, [contextMenu]);

  // Usar el hook personalizado para historial
  const { past, future, saveState, undo: historyUndo, redo: historyRedo, canUndo, canRedo } = useDiagramHistory();

  // Saving / errors / toast
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);

  // Carga inicial
  useEffect(() => {


    if (estructuraInicial?.clases) {
      const initialNodes = estructuraInicial.clases.map((clase, idx) => ({
        id: clase.id || `node-${idx}`,
        type: 'claseNode',
        position: clase.position || { x: 100 + idx * 200, y: 100 },
        data: { ...clase, label: clase.nombre || `Clase ${idx + 1}` }
      }));
      setNodes(initialNodes);
    } else {
      setNodes([]);
    }

    if (estructuraInicial?.relaciones) {
      const initialEdges = estructuraInicial.relaciones.map((r, idx) => ({
        id: r.id || `edge-${idx}`,
        source: r.source,
        target: r.target,
        type: 'relacionNode',
        data: {
          tipo: r.tipo || 'asociacion',
          multiplicidadSource: r.multiplicidadSource || '1',
          multiplicidadTarget: r.multiplicidadTarget || 'N',
          label: r.label || null,
        },
      }));
      setEdges(initialEdges);
      console.log('DEBUG: Aristas iniciales cargadas. Total:', initialEdges.length);
    } else {
      setEdges([]);
    }

    setIsLoading(false);
  }, [estructuraInicial, setNodes, setEdges]);

  // Guardar estado en historial cuando cambian nodes o edges
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      saveState(nodes, edges);
    }
  }, [nodes, edges]);

  // Detectar si SmartEdgeResolved es un componente React válido
  const isSmartEdgeComponent = useMemo(() => {
    if (!SmartEdgeResolved) return false;
    // función o clase o elemento con render o $$typeof simboliza componente React
    return typeof SmartEdgeResolved === 'function' || !!SmartEdgeResolved?.$$typeof || !!SmartEdgeResolved?.render;
  }, []);

  // Nombre del tipo a usar para nuevas conexiones (si no hay SmartEdge disponible, caemos a 'relacionNode')
  const smartTypeName = useMemo(() => (isSmartEdgeComponent ? 'smart' : 'relacionNode'), [isSmartEdgeComponent]);

  // edgeTypes: si SmartEdgeResolved no es un componente, asignamos RelacionNode al key 'smart' (fallback seguro)
  const edgeTypes = useMemo(() => ({
    [smartTypeName]: isSmartEdgeComponent ? SmartEdgeResolved : RelacionNode,
    relacionNode: RelacionNode
  }), [smartTypeName, isSmartEdgeComponent]);

  // Connection line type: usar 'smart' solo si hay componente smart disponible; sino usar 'straight'
  const connectionLineTypeProp = isSmartEdgeComponent ? 'smart' : 'straight';

  const onConnect = useCallback((params) => {
    // Guardar estado antes del cambio
    saveState(nodes, edges);

    // Validar que no sea una conexion consigo mismo 
    if (params.source === params.target) {
      setToast({ type: 'error', message: 'No se puede conectar un nodo consigo mismo.' });
      return;
    }
    const nuevaRelacion = {
      ...params,
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      type: smartTypeName, // usa 'smart' o 'relacionNode' según disponibilidad
      data: {
        tipo: 'asociacion', //tipo por defecto 
        multiplicidadSource: '1',
        multiplicidadTarget: 'N',
      },
    };
    console.log('DEBUG: Creando nueva relación:', nuevaRelacion);
    setEdges((eds) => addEdge(nuevaRelacion, eds));
  }, [nodes, edges, saveState, smartTypeName]);

  // Drag handlers para canvas
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Drop handler mejorado con corrección de posición
  const handleDrop = (event) => {
    event.preventDefault();
    console.log('Evento onDrop disparado:', event);

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

    // Calcular posición CORREGIDA (considerando scroll y transformaciones)
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const scale = reactFlowInstanceRef.current?.zoom || 1;
    const sidebarWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--editor-sidebar-width'), 10) || 0;

    const posicion = {
      x: (event.clientX - bounds.left - sidebarWidth + window.scrollX) / scale,
      y: (event.clientY - bounds.top + window.scrollY) / scale,
    };

    console.log('Posición calculada corregida:', posicion);

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
  };

  // Node interactions
  const handleNodeClick = (event, node) => {
    setClaseEditando(node);
    if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, node: null, edge: null });
  };

  const handleNodeDoubleClick = (event, node) => {
    event.preventDefault();
    event.stopPropagation();
    setClaseEditando(node);
    setModalAbierto(true);
    if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, node: null, edge: null });
  };

  const handleNodeContextMenu = (event, node) => {
    event.preventDefault();
    event.stopPropagation();
    const bounds = reactFlowWrapper.current ? reactFlowWrapper.current.getBoundingClientRect() : { left: 0, top: 0 };



    //usar coordenadas absolutas de la ventana
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      node,
      edge: null,
    });
  };

  const handleEdgeContextMenu = (event, edge) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('DEBUG: handleEdgeContextMenu disparado para relación:', edge);
    const bounds = reactFlowWrapper.current ? reactFlowWrapper.current.getBoundingClientRect() : { left: 0, top: 0 };
    console.log('🟢 RELACIÓN - Context menu click:', {
      clientX: event.clientX,
      clientY: event.clientY,
      edgeId: edge.id
    });
    //usar coordenadas absolutas de la ventana
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      node: null,
      edge,
    });
  };
  // DEBUG adicional: registrar cuando cambie el context menu (sin setTimeout)
  useEffect(() => {
    try {
      console.debug('[EditorDiagrama] after setContextMenu, contextMenuRef:', JSON.parse(JSON.stringify(contextMenuRef.current)));
    } catch (err) {
      console.debug('[EditorDiagrama] after setContextMenu, contextMenuRef (non-serializable):', contextMenuRef.current);
    }
  }, [contextMenu]);



  // Context menu actions
  const copiarNodo = (node) => {
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
    setContextMenu({ visible: false, x: 0, y: 0, node: null, edge: null });
  };

  const eliminarNodoMenu = (node) => {
    saveState(nodes, edges);

    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));

    if (claseEditando && claseEditando.id === node.id) {
      setModalAbierto(false);
      setClaseEditando(null);
    }
    setContextMenu({ visible: false, x: 0, y: 0, node: null, edge: null });
  };

  const eliminarRelacion = (relacionId) => {
    console.log('DEBUG: eliminarRelacion llamada para relación ID:', relacionId);
    console.log('DEBUG: Edges actuales:', edges);

    saveState(nodes, edges);

    const nuevasEdges = edges.filter((e) => e.id !== relacionId);
    console.log('DEBUG: Edges después de eliminar:', nuevasEdges);

    setEdges(nuevasEdges);
    setContextMenu({ visible: false, x: 0, y: 0, node: null, edge: null });
  };

  // util: calcular puntos ortogonales simples entre dos extremos
  const calcularOrtogonal = (sx, sy, tx, ty) => {
    const midX = Math.round((sx + tx) / 2);
    return [
      { x: Math.round(sx), y: Math.round(sy) },
      { x: midX, y: Math.round(sy) },
      { x: midX, y: Math.round(ty) },
      { x: Math.round(tx), y: Math.round(ty) }
    ];
  };

  // NUEVO (REEMPLAZA): cambiar estilo/layout de relación ('straight' | 'orthogonal')
  const cambiarEstiloRelacion = (relacionId, layout) => {
    // Guardar estado en historial
    saveState(nodes, edges);

    setEdges((currentEdges) =>
      currentEdges.map((e) => {
        if (e.id !== relacionId) return e;
        // Solo actualizar el layout en data; no calcular ni escribir puntos aquí.
        // RelacionNode se encargará de calcular la polyline según sourceX/targetX
        const newData = { ...e.data, layout };
        // Si pasamos a lineal, borrar puntos guardados (si los hubiera) para evitar confusiones
        if (layout === 'straight' && newData.points) {
          const nd = { ...newData };
          delete nd.points;
          return { ...e, data: nd };
        }
        return { ...e, data: newData };
      })
    );

    // Cerrar menú contextual
    setContextMenu({ visible: false, x: 0, y: 0, node: null, edge: null });

    console.debug && console.debug(`[EditorDiagrama] estilo de relación ${relacionId} -> ${layout}`);
  };





  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, node: null, edge: null });
  };

  // Serializa estado actual del editor
  const serializarEstructura = (nodesSnapshot = null, edgesSnapshot = null) => {
    const ns = nodesSnapshot || nodes;
    const es = edgesSnapshot || edges;

    const clases = ns.map((n) => ({
      id: n.id,
      nombre: n.data?.nombre || n.data?.label,
      estereotipo: n.data?.estereotipo,
      atributos: n.data?.atributos || [],
      metodos: n.data?.metodos || [],
      position: n.position,
    }));

    const relaciones = es.map((e) => ({
      id: e.id || `${e.source}_${e.target}`,
      source: e.source,
      target: e.target,
      tipo: e.data?.tipo || 'asociacion',
      multiplicidadSource: e.data?.multiplicidadSource || '1',
      multiplicidadTarget: e.data?.multiplicidadTarget || 'N',
      label: e.data?.label || null,
    }));

    return { clases, relaciones };
  };

  // Persistencia via diagramService
  const persistDiagrama = async (estructuraSnapshot = null) => {
    const payload = {
      nombre: estructuraInicial?.nombre || 'Diagrama',
      descripcion: estructuraInicial?.descripcion || '',
      proyecto: estructuraInicial?.proyecto || projectId || null,
      estructura: estructuraSnapshot || serializarEstructura(),
    };

    console.log('DEBUG: Estructura enviada al backend (payload):', payload);

    setIsSaving(true);
    try {
      let res;
      if (diagramaId) {
        res = await actualizarDiagrama(diagramaId, payload);
        console.log('DEBUG: Diagrama actualizado (respuesta):', res?.data ?? res);
      } else {
        res = await crearDiagrama(payload);
        console.log('DEBUG: Diagrama creado (respuesta):', res?.data ?? res);
      }
      setToast({ type: 'success', message: 'Diagrama guardado correctamente' });
      setIsSaving(false);
      return res?.data ?? res;
    } catch (error) {
      setIsSaving(false);
      console.error('DEBUG: Error al guardar el diagrama:', error);
      if (error.response?.status === 401) {
        console.error('DEBUG: Error de autenticación. Verifica el token.');
      }
      setToast({ type: 'error', message: 'Error al guardar el diagrama' });
      throw error;
    }
  };

  const validarDiagramaAntesDeGuardar = () => {
    console.log('DEBUG: Validación de relaciones eliminada. Procediendo sin validaciones.');
    return true;
  };

  // Handler público para botón Guardar
  const handleGuardarDiagrama = async () => {
    console.log('DEBUG: Método handleGuardarDiagrama ejecutado.');

    if (!validarDiagramaAntesDeGuardar()) {
      console.warn('DEBUG: Validación fallida. No se puede guardar el diagrama.');
      return;
    }

    console.log('DEBUG: Validación exitosa. Procediendo a guardar el diagrama.');

    const estructura = serializarEstructura();
    try {
      await persistDiagrama(estructura);
      console.log('DEBUG: Diagrama guardado exitosamente.');
    } catch (error) {
      console.error('DEBUG: Error al guardar el diagrama:', error);
    }
  };

  // Llamado cuando se guarda la clase desde el modal
  const handleGuardarClase = (claseActualizada) => {
    saveState(nodes, edges);

    const updatedNodes = nodes.map((n) =>
      n.id === claseEditando.id ? { ...n, data: { ...n.data, ...claseActualizada } } : n
    );

    setNodes(updatedNodes);
    setModalAbierto(false);
    setClaseEditando(null);

    const estructuraSnapshot = serializarEstructura(updatedNodes, edges);
    persistDiagrama(estructuraSnapshot);
  };

  const handleCancelarModal = () => {
    setModalAbierto(false);
    setClaseEditando(null);
    persistDiagrama();
  };

  // Undo/Redo functions corregidas
  const handleUndo = () => {
    if (!canUndo) return;

    const previousState = historyUndo(nodes, edges);
    if (previousState) {
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
    }
  };

  const handleRedo = () => {
    if (!canRedo) return;

    const nextState = historyRedo();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
    }
  };

  // NodeTypes y EdgeTypes memoizados para mejor rendimiento
  const nodeTypes = useMemo(() => ({
    claseNode: ClaseNodeRF
  }), []);


  // Handlers de cambio que registran en el historial
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Escuchar cambios de puntos de edge emitidos por RelacionNode
  useEffect(() => {
    const handler = (ev) => {
      try {
        const detail = ev.detail || {};
        // aceptar tanto { id, points } como { edgeId, points }
        const edgeId = detail.id || detail.edgeId;
        const points = detail.points;
        if (!edgeId || !points) return;
        console.debug('[EditorDiagrama] received edge-points-change for', edgeId, points);
        setEdges((current) => current.map((e) => e.id === edgeId ? { ...e, data: { ...e.data, points } } : e));
      } catch (err) {
        console.warn('Error handling edge-points-change:', err);
      }
    };
    window.addEventListener('edge-points-change', handler);
    return () => window.removeEventListener('edge-points-change', handler);
  }, [setEdges]);

  // helper: elegir lado y handle index en base a coordenada dentro del nodo
  const pickHandleForNode = (node, x, y, which) => {
    // which: 'source' | 'target' -> determina sufijo src/tgt en el id del handle
    const nw = node.position.x;
    const nh = node.position.y;
    const w = node.width || 180; // fallback si no hay width/height
    const h = node.height || 120;
    const cx = nw + w / 2;
    const cy = nh + h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    let side;
    if (horizontal) side = dx > 0 ? 'right' : 'left';
    else side = dy > 0 ? 'bottom' : 'top';
    // elegir índice 1..4 según la posición relativa a la arista
    let idx = 1;
    if (side === 'left' || side === 'right') {
      const rel = (y - nh) / h; // 0..1
      idx = Math.min(4, Math.max(1, Math.ceil(rel * 4)));
    } else {
      const rel = (x - nw) / w;
      idx = Math.min(4, Math.max(1, Math.ceil(rel * 4)));
    }
    const typePart = which === 'source' ? 'src' : 'tgt';
    // Devolver id exactamente igual al id de Handle en ClaseNodeRF: `${nodeId}-${side}-${typePart}-${idx}`
    return `${node.id}-${side}-${typePart}-${idx}`;
  };

  useEffect(() => {
    const handler = (ev) => {
      const { id: edgeId, which, point, clientX, clientY } = ev.detail || {};
      if (!edgeId || !which || !point) return;
      // Primero intento detectar un handle DOM usando clientX/clientY (más fiable)
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        try {
          const el = document.elementFromPoint(clientX, clientY);
          const handleEl = el && (el.closest ? el.closest('.react-flow__handle') : null);
          // Fallback buscar cualquier elemento con data-handleid o id en el área
          const foundHandle = handleEl || (el && (el.getAttribute('data-handleid') || el.id) ? el : null);
          if (foundHandle) {
            // extraer nodeId del contenedor del nodo
            const nodeEl = foundHandle.closest && foundHandle.closest('.react-flow__node');
            const nodeId = nodeEl ? nodeEl.getAttribute('data-id') || nodeEl.getAttribute('id') : null;
            const handleId = foundHandle.getAttribute('data-handleid') || foundHandle.getAttribute('id') || null;
            if (nodeId && handleId) {
              setEdges((eds) => eds.map(e => {
                if (e.id !== edgeId) return e;
                if (which === 'source') {
                  return { ...e, source: nodeId, sourceHandle: handleId };
                } else {
                  return { ...e, target: nodeId, targetHandle: handleId };
                }
              }));
              return; // hecho: atado al handle detectado
            }
          }
        } catch (err) {
          console.warn('[EditorDiagrama] error detecting handle by DOM', err);
        }
      }
      // fallback: buscar nodo por posición (antigua lógica)
      const found = nodes.find(n => {
        const nx = n.position.x;
        const ny = n.position.y;
        const w = n.width || 180;
        const h = n.height || 120;
        return point.x >= nx && point.x <= nx + w && point.y >= ny && point.y <= ny + h;
      });
      if (found) {
        const handleId = pickHandleForNode(found, point.x, point.y, which);
        setEdges((eds) => eds.map(e => {
          if (e.id !== edgeId) return e;
          if (which === 'source') {
            return { ...e, source: found.id, sourceHandle: handleId };
          } else {
            return { ...e, target: found.id, targetHandle: handleId };
          }
        }));
      } else {
        console.debug && console.debug('[EditorDiagrama] endpoint released on empty space -> no reattach', edgeId, which, point);
      }
    };
    window.addEventListener('edge-endpoint-change', handler);
    return () => window.removeEventListener('edge-endpoint-change', handler);
  }, [nodes, setEdges]);

  // Highlight visual mientras se arrastra endpoint sobre nodos
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  // Estado de asignación por click (esperando que el usuario haga click en un handle)
  const [assignPending, setAssignPending] = useState(null); // { edgeId, which }
  useEffect(() => {
    // Exponer helper global temporal que los Handles llamarán cuando sean clickeados
    if (assignPending) {
      window.assignSelectedEdge = (handleId, nodeId) => {
        const { edgeId, which } = assignPending;
        console.debug && console.debug('[EditorDiagrama] assignSelectedEdge called', { edgeId, which, handleId, nodeId });
        setEdges((eds) => eds.map(e => {
          if (e.id !== edgeId) return e;
          if (which === 'source') {
            return { ...e, source: nodeId, sourceHandle: handleId };
          } else {
            return { ...e, target: nodeId, targetHandle: handleId };
          }
        }));
        setAssignPending(null);
        delete window.assignSelectedEdge;
        setToast({ type: 'success', message: 'Relación asignada al punto seleccionado' });
      };
      setToast({ type: 'info', message: 'Click en el punto verde donde quieres anclar la relación' });
    } else {
      // limpiar helper global si no hay pending
      if (window.assignSelectedEdge) delete window.assignSelectedEdge;
    }
    return () => { if (window.assignSelectedEdge) delete window.assignSelectedEdge; };
  }, [assignPending, setEdges]);

  // Escuchar la petición de "selección rápida" desde RelacionNode
  useEffect(() => {
    const handler = (ev) => {
      const detail = ev.detail || {};
      const edgeId = detail.id;
      const which = detail.which;
      if (!edgeId || !which) return;
      console.debug && console.debug('[EditorDiagrama] entering assignPending mode for', { edgeId, which });
      setAssignPending({ edgeId, which });
    };
    window.addEventListener('edge-select-for-handle-assign', handler);
    return () => window.removeEventListener('edge-select-for-handle-assign', handler);
  }, []);

  return (
    <div className="editor-canvas-wrapper" style={{ height: '100%' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes} // SIN elementos temporales
        edges={edges} // SIN elementos temporale
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        connectable={true}



        nodeTypes={nodeTypes}

        onEdgeUpdate={(oldEdge, newConnection) => {
          setEdges((eds) => eds.map(e => e.id === oldEdge.id ? { ...e, ...newConnection } : e));
        }}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}

        // 👇 Aquí capturas el clic derecho en un nodo

        onNodeContextMenu={(event, node) => {
          handleNodeContextMenu(event, node);
        }}
        // 👇 Aquí capturas el clic derecho en una relación (edge)
        onEdgeContextMenu={(event, edge) => {
          handleEdgeContextMenu(event, edge);
        }}
        fitView
        onInit={onReactFlowInit}
        connectionLineType={connectionLineTypeProp}
        connectionRadius={20}
      >
        <Controls />
        <Background gap={16} />
      </ReactFlow>

      {/* Renderizar el menú contextual */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        node={contextMenu.node}
        edge={contextMenu.edge}
        onEditarNodo={(node) => {
          setClaseEditando(node);
          setModalAbierto(true);
        }}
        onEditarRelacion={handleEditarRelacion}
        onCopiarNodo={copiarNodo}
        onEliminarNodo={eliminarNodoMenu}
        onEliminarRelacion={eliminarRelacion}
        onClose={closeContextMenu}
        onCambiarEstiloRelacion={cambiarEstiloRelacion}
      />

      {/* Toast notifications */}
      {toast && (
        <div
          className={`fixed top-20 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          style={{ animation: 'fadeIn 0.3s ease-in-out' }}
        >
          {toast.message}
        </div>
      )}

      {modalAbierto && (
        <EditarClaseModal
          clase={claseEditando?.data}
          onGuardar={handleGuardarClase}
          onCancelar={handleCancelarModal}
        />
      )}

      {modalRelacionAbierto && (
        <EditarRelacionModal
          relacion={relacionEditando}
          onGuardar={handleGuardarRelacion}
          onCancelar={() => setModalRelacionAbierto(false)}
        />
      )}
    </div>
  );
};

export default EditorDiagrama;
