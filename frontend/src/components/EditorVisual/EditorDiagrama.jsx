import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ReactFlow, addEdge, useEdgesState, useNodesState, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ClaseNodeRF from './ClaseNodeRF.jsx';
// import Sidebar from './Sidebar'; // Eliminado: Sidebar se renderiza en la página padre
import EditarClaseModal from './EditarClaseModal';
import { crearDiagrama, actualizarDiagrama } from '../../services/diagramService';

const nodeTypes = { claseNode: ClaseNodeRF };

// En la firma del componente acepta opcionalmente projectId (prop desde la página padre)
const EditorDiagrama = ({ estructuraInicial, onGuardar, projectId = null, diagramaId = null }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [claseEditando, setClaseEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const lastDropRef = useRef(0); // evita duplicados (timestamp)

  // Context menu state
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, node: null });

  // History (undo/redo)
  const [historyPast, setHistoryPast] = useState([]);
  const [historyFuture, setHistoryFuture] = useState([]);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  // Saving / errors / toast
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const [validationErrors, setValidationErrors] = useState(null);

  // Update refs when nodes/edges change
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // Carga inicial
  useEffect(() => {
    console.log('DEBUG: useEffect ejecutado. estructuraInicial:', estructuraInicial);

    if (estructuraInicial?.clases) {
      const initialNodes = estructuraInicial.clases.map((clase, idx) => ({
        id: clase.id || `node-${idx}`,
        type: 'claseNode',
        position: clase.position || { x: 100 + idx * 200, y: 100 },
        data: clase
      }));
      setNodes(initialNodes);
      console.log('DEBUG: Nodos iniciales cargados desde estructuraInicial. Total:', initialNodes.length);
    } else {
      console.warn('No hay estructura inicial; editor vacío.');
    }

    if (estructuraInicial?.relaciones) {
      const initialEdges = estructuraInicial.relaciones.map((r, idx) => ({
        id: r.id || `edge-${idx}`,
        source: r.source,
        target: r.target,
        data: { tipo: r.tipo, label: r.label },
      }));
      setEdges(initialEdges);
      console.log('DEBUG: Aristas iniciales cargadas. Total:', initialEdges.length);
    }

    // limpiar historial al cargar nueva estructura
    setHistoryPast([]);
    setHistoryFuture([]);
    setIsLoading(false);
    console.log('DEBUG: Estado de carga actualizado a false.');
  }, [estructuraInicial, setNodes, setEdges]);

  const onConnect = useCallback((params) => {
    // record history before creating edge
    recordHistoryBeforeChange();
    setEdges((eds) => addEdge(params, eds));
  }, []);

  // History helpers
  const recordHistoryBeforeChange = () => {
    const snapshot = { nodes: nodesRef.current, edges: edgesRef.current };
    setHistoryPast((prev) => {
      const next = prev.concat([snapshot]);
      // keep last 50
      return next.length > 50 ? next.slice(next.length - 50) : next;
    });
    setHistoryFuture([]);
  };

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const last = historyPast[historyPast.length - 1];
    const current = { nodes: nodesRef.current, edges: edgesRef.current };
    setHistoryFuture((f) => f.concat([current]));
    setHistoryPast((p) => p.slice(0, p.length - 1));
    setNodes(last.nodes);
    setEdges(last.edges);
    setToast({ type: 'info', message: 'Deshacer aplicado' });
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[historyFuture.length - 1];
    const current = { nodes: nodesRef.current, edges: edgesRef.current };
    setHistoryPast((p) => p.concat([current]));
    setHistoryFuture((f) => f.slice(0, f.length - 1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setToast({ type: 'info', message: 'Rehacer aplicado' });
  };

  // Drag handlers para canvas
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Drop handler: coloca el nodo exactamente donde está el cursor (robusto ante overlays/transform)
  const handleDrop = (event) => {
    event.preventDefault();
    console.log('Evento onDrop disparado:', event);

    // Prevenir eventos duplicados usando un timestamp
    const now = Date.now();
    if (now - lastDropRef.current < 300) { // Aumentar el umbral a 300ms
      console.warn('Evento duplicado detectado, ignorando...');
      return;
    }
    lastDropRef.current = now;

    // Obtener el tipo de nodo arrastrado
    const tipoNodo = event.dataTransfer.getData('application/reactflow');
    if (!tipoNodo) {
      console.warn('No se pudo obtener el tipo de nodo desde el evento de arrastre.');
      return;
    }

    // Calcular posición en el canvas manualmente, ajustando por desplazamiento y escalado
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const scale = reactFlowInstance?.zoom || 1; // Obtener el escalado actual del canvas
    const sidebarWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--editor-sidebar-width'), 10) || 0;

    const posicion = {
      x: (event.clientX - bounds.left - sidebarWidth) / scale,
      y: (event.clientY - bounds.top) / scale,
    };

    console.log('Posición calculada ajustada:', posicion);

    const nuevoNodo = {
      id: `${tipoNodo}-${Date.now()}`, // ID único para el nodo
      type: tipoNodo, // Tipo de nodo (e.g., claseNode)
      position: posicion, // Posición calculada manualmente
      data: { label: `Nuevo ${tipoNodo}` }, // Datos iniciales del nodo
    };

    setNodes((nds) => [...nds, nuevoNodo]); // Agregar nodo al estado
    recordHistoryBeforeChange(); // Registrar en el historial
  };

  // node interactions
  const handleNodeClick = (event, node) => {
    setClaseEditando(node);
    if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const handleNodeDoubleClick = (event, node) => {
    event.preventDefault();
    event.stopPropagation();
    setClaseEditando(node);
    setModalAbierto(true);
    if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const handleNodeContextMenu = (event, node) => {
    event.preventDefault();
    event.stopPropagation();
    const bounds = reactFlowWrapper.current ? reactFlowWrapper.current.getBoundingClientRect() : { left: 0, top: 0 };
    setContextMenu({
      visible: true,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      node,
    });
  };

  // close context menu on outside/Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!reactFlowWrapper.current) {
        setContextMenu({ visible: false, x: 0, y: 0, node: null });
        return;
      }
      const menuEl = reactFlowWrapper.current.querySelector('.rf-context-menu');
      if (menuEl && menuEl.contains(e.target)) return;
      setContextMenu({ visible: false, x: 0, y: 0, node: null });
    };
    const onKey = (e) => { if (e.key === 'Escape') { setContextMenu({ visible: false, x: 0, y: 0, node: null }); setToast(null); } };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // context menu actions (record history before mutating)
  const copiarNodo = () => {
    const node = contextMenu.node;
    if (!node) return;
    recordHistoryBeforeChange();
    const newId = `n_${Date.now()}`;
    const offset = 24;
    const cloned = {
      id: newId,
      type: node.type,
      position: { x: node.position.x + offset, y: node.position.y + offset },
      data: JSON.parse(JSON.stringify(node.data)),
    };
    setNodes((nds) => nds.concat(cloned));
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const eliminarNodoMenu = () => {
    const node = contextMenu.node;
    if (!node) return;
    recordHistoryBeforeChange();
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
    if (claseEditando && claseEditando.id === node.id) {
      setModalAbierto(false);
      setClaseEditando(null);
    }
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  // Serializa estado actual del editor a la "estructura" que se enviará al backend
  // Acepta snapshots opcionales para evitar condiciones de carrera (usar cuando se acaba de setNodes)
  const serializarEstructura = (nodesSnapshot = null, edgesSnapshot = null) => {
    const ns = nodesSnapshot || nodes;
    const es = edgesSnapshot || edges;
    const clases = ns.map((n) => ({
      id: n.id,
      nombre: n.data?.nombre,
      estereotipo: n.data?.estereotipo,
      atributos: n.data?.atributos || [],
      metodos: n.data?.metodos || [],
      position: n.position,
    }));

    const relaciones = es.map((e) => ({
      id: e.id || `${e.source}_${e.target}`,
      source: e.source,
      target: e.target,
      tipo: e.data?.tipo || null,
      label: e.data?.label || null,
    }));

    return { clases, relaciones };
  };

  // Persistencia via diagramService: crea o actualiza según exista id
  // acepta estructuraSnapshot opcional (resultado de serializarEstructura) para evitar usar estado desincronizado
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

  const validarRelacion = (nuevaRelacion) => {
    // Verificar si los nodos conectados existen
    const origenExiste = nodes.some((nodo) => nodo.id === nuevaRelacion.source);
    const destinoExiste = nodes.some((nodo) => nodo.id === nuevaRelacion.target);

    if (!origenExiste || !destinoExiste) {
      setToast({ type: 'error', message: 'Uno o ambos nodos de la relación no existen.' });
      return false;
    }

    // Verificar si ya existe una relación entre los mismos nodos
    const relacionDuplicada = edges.some(
      (relacion) =>
        relacion.source === nuevaRelacion.source && relacion.target === nuevaRelacion.target
    );

    if (relacionDuplicada) {
      setToast({ type: 'error', message: 'Ya existe una relación entre estos nodos.' });
      return false;
    }

    return true;
  };

  const validarDiagramaAntesDeGuardar = () => {
    console.log('DEBUG: Validación de relaciones eliminada. Procediendo sin validaciones.');
    return true; // Permitir siempre guardar el diagrama
  };

  // handler público para botón Guardar
  const handleGuardarDiagrama = async () => {
    console.log('DEBUG: Método handleGuardarDiagrama ejecutado.');

    if (!validarDiagramaAntesDeGuardar()) {
      console.warn('DEBUG: Validación fallida. No se puede guardar el diagrama.');
      return; // Detener el guardado si hay errores
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

  // llamado cuando se guarda la clase desde el modal
  const handleGuardarClase = (claseActualizada) => {
    recordHistoryBeforeChange();

    // crear snapshot de nodos con el cambio aplicado (no depender de setState inmediato)
    const updatedNodes = (nodesRef.current || nodes).map((n) =>
      n.id === claseEditando.id ? { ...n, data: claseActualizada } : n
    );

    setNodes(updatedNodes); // actualiza UI
    setModalAbierto(false);
    setClaseEditando(null);

    // serializar con snapshot explícito y pasarla a persistDiagrama
    const estructuraSnapshot = serializarEstructura(updatedNodes, edgesRef.current);
    persistDiagrama(estructuraSnapshot);
  };

  // onCancelar del modal: cierra modal y también persiste estado actual
  const handleCancelarModal = () => {
    setModalAbierto(false);
    setClaseEditando(null);
    persistDiagrama();
  };

  return (
    // Usar wrapper que respeta el sidebar fijo (index.css define .editor-canvas-wrapper)
    <div className="editor-canvas-wrapper" style={{ height: '100%' }}>
      <div
        ref={reactFlowWrapper}
        className="editor-fullscreen reactflow-wrapper"
        style={{ flex: 1, minHeight: 420 }}
        onDrop={handleDrop} // Evento registrado aquí
        onDragOver={handleDragOver}
      >
        {/* Controles: Guardar + Undo/Redo + toast (fijos en la ventana) */}
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
            onClick={handleGuardarDiagrama} // Llama al método handleGuardarDiagrama
            className="bg-green-600 hover:bg-green-700 text-white text-lg px-5 py-2 rounded-md shadow-md fixed-control-btn"
            title="Guardar diagrama"
            disabled={isSaving} // Deshabilitar mientras se guarda
            style={{ minWidth: 120, height: 44 }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>

          <button
            onClick={handleUndo}
            className="bg-white border px-3 py-2 rounded"
            title="Deshacer"
            disabled={historyPast.length === 0}
            style={{ height: 44 }}
          >
            ↶
          </button>
          <button
            onClick={handleRedo}
            className="bg-white border px-3 py-2 rounded"
            title="Rehacer"
            disabled={historyFuture.length === 0}
            style={{ height: 44 }}
          >
            ↷
          </button>
        </div>

        {isLoading ? (
          <div>Cargando editor...</div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onNodeContextMenu={handleNodeContextMenu}
            nodeTypes={nodeTypes}
            fitView
            onInit={(instance) => setReactFlowInstance(instance)} // Inicializa reactFlowInstance
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Controls />
            <Background gap={16} />
          </ReactFlow>
        )}

        {/* Context menu */}
        {contextMenu.visible && (
          <div
            className="rf-context-menu bg-white border rounded shadow-md text-sm"
            style={{
              position: 'absolute',
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 9999,
              minWidth: 140,
            }}
          >
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                setClaseEditando(contextMenu.node);
                setModalAbierto(true);
                setContextMenu({ visible: false, x: 0, y: 0, node: null });
              }}
            >
              Editar
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={copiarNodo}>
              Copiar
            </button>
            <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100" onClick={eliminarNodoMenu}>
              Eliminar
            </button>
          </div>
        )}

        {/* Toast / errores de validación */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
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
    </div>
  );
};

export default EditorDiagrama;

