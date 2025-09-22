import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { ReactFlow, addEdge, useEdgesState, useNodesState, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ClaseNodeRF from './ClaseNodeRF.jsx';
import RelacionNode from './RelacionNode.jsx';
import EditarClaseModal from './EditarClaseModal';
import { crearDiagrama, actualizarDiagrama } from '../../services/diagramService';
import ContextMenu from './ContextMenu';
import EditarRelacionModal from './EditarRelacionModal';



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

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const lastDropRef = useRef(0);

  //Estados para edicion de relaciones
  const [relacionEditando, setRelacionEditando] = useState(null);
  const [modalRelacionAbierto, setModalRelacionAbierto] = useState(false);

  // Función para editar relación (AGREGA ESTA FUNCIÓN)
  const handleEditarRelacion = (relacion) => {
    console.log('DEBUG: Editando relación:', relacion);
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

  // Usar el hook personalizado para historial
  const { past, future, saveState, undo: historyUndo, redo: historyRedo, canUndo, canRedo } = useDiagramHistory();

  // Saving / errors / toast
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);

  // Carga inicial
  useEffect(() => {
    console.log('DEBUG: useEffect ejecutado. estructuraInicial:', estructuraInicial);

    if (estructuraInicial?.clases) {
      const initialNodes = estructuraInicial.clases.map((clase, idx) => ({
        id: clase.id || `node-${idx}`,
        type: 'claseNode',
        position: clase.position || { x: 100 + idx * 200, y: 100 },
        data: { ...clase, label: clase.nombre || `Clase ${idx + 1}` }
      }));
      setNodes(initialNodes);
      console.log('DEBUG: Nodos iniciales cargados desde estructuraInicial. Total:', initialNodes.length);
    } else {
      console.warn('No hay estructura inicial; editor vacío.');
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

  const onConnect = useCallback((params) => {
    // Guardar estado antes del cambio
    saveState(nodes, edges);

    //Validar que no sea una conexion consigo mismo 
    if (params.source === params.target) {
      setToast({ type: 'error', message: 'No se puede conectar un nodo consigo mismo.' });
      return;
    }
    const nuevaRelacion = {
      ...params,
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      type: 'relacionNode',
      data: {
        tipo: 'asociacion', //tipo por defecto 
        multiplicidadSource: '1',
        multiplicidadTarget: 'N',

      },
    };
    console.log('DEBUG: Creando nueva relación:', nuevaRelacion);
    setEdges((eds) => addEdge(nuevaRelacion, eds));
  }, [nodes, edges, saveState]);

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
    if (now - lastDropRef.current < 300) {
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
    const scale = reactFlowInstance?.zoom || 1;
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

    console.log('🟢 NODO - Context menu click:', {
      clientX: event.clientX,
      clientY: event.clientY,
      nodeId: node.id
    });

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
    console.log('DEBUG: Edges antes de eliminar:', edges);

    saveState(nodes, edges);

    const nuevasEdges = edges.filter((e) => e.id !== relacionId);
    console.log('DEBUG: Edges después de eliminar:', nuevasEdges);

    setEdges(nuevasEdges);
    setContextMenu({ visible: false, x: 0, y: 0, node: null, edge: null });
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

  const edgeTypes = useMemo(() => ({
    relacionNode: RelacionNode
  }), []);


  // Handlers de cambio que registran en el historial
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  console.log('🔴 Estado actual del contexto:', {
    contextMenuVisible: contextMenu.visible,
    contextMenuX: contextMenu.x,
    contextMenuY: contextMenu.y,
    hasNode: !!contextMenu.node,
    hasEdge: !!contextMenu.edge,
    nodeId: contextMenu.node?.id,
    edgeId: contextMenu.edge?.id
  });

  console.log('🔴 EdgeTypes configurado:', edgeTypes);
  console.log('🔴 Número de edges:', edges.length);
  console.log('🔴 Edges disponibles:', edges.map(e => ({ id: e.id, type: e.type })));


  return (
    <div className="editor-canvas-wrapper" style={{ height: '100%' }}>
      <div
        ref={reactFlowWrapper}
        className="editor-fullscreen reactflow-wrapper"
        style={{ flex: 1, minHeight: 420 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Controles: Guardar + Undo/Redo + toast */}
        <div style={{
          position: 'fixed',
          right: 20,
          top: 'calc(var(--header-height) + 12px)',
          zIndex: 999,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}>
          <button
            onClick={handleGuardarDiagrama}
            className="bg-green-600 hover:bg-green-700 text-white text-lg px-5 py-2 rounded-md shadow-md fixed-control-btn"
            title="Guardar diagrama"
            disabled={isSaving}
            style={{ minWidth: 120, height: 44 }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>

          <button
            onClick={handleUndo}
            className={`bg-white border px-3 py-2 rounded ${canUndo ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            title="Deshacer"
            disabled={!canUndo}
            style={{ height: 44 }}
          >
            ↶
          </button>
          <button
            onClick={handleRedo}
            className={`bg-white border px-3 py-2 rounded ${canRedo ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            title="Rehacer"
            disabled={!canRedo}
            style={{ height: 44 }}
          >
            ↷
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-green-600 text-lg">Cargando editor...</div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}




            nodeTypes={nodeTypes}
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
            onInit={(instance) => setReactFlowInstance(instance)}
            connectionLineType="smoothstep"
            connectionRadius={20}
          >
            <Controls />
            <Background gap={16} />
          </ReactFlow>
        )}

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
      </div>

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
