// EditorDiagrama.jsx
import React, { useEffect, useCallback, useRef } from 'react';
import { useEditorState } from './hooks/useEditorState';
import { useDiagramHistory } from './hooks/useDiagramHistory';
import { useDiagramPersistence } from './hooks/useDiagramPersistence';
import { useDiagramDragAndDrop } from './hooks/useDiagramDragAndDrop';
import { useEdgeManagement } from './hooks/useEdgeManagement';
import { useContextMenu } from './hooks/useContextMenu';
import DiagramCanvas from './components/DiagramCanvas';
import ModalsManager from './components/ModalsManager';
import ToastNotifications from './components/ToastNotifications';
import DiagramControls from './components/DiagramControls';
import ClaseNodeRF from './ClaseNodeRF';
import Toolbar from './Toolbar'; // Asegúrate de importar Toolbar
import { TIPOS_RELACION } from './constants/umlTypes'; // Asegúrate de importar esto

/**
 * Componente principal del editor de diagramas UML
 * 
 * @param {Object} props
 * @param {Object} props.estructuraInicial - Estructura inicial del diagrama
 * @param {string} props.projectId - ID del proyecto (opcional)
 * @param {string} props.diagramaId - ID del diagrama (opcional)
 * @returns {JSX.Element} Editor de diagramas completo
 */
const EditorDiagrama = ({ estructuraInicial, projectId = null, diagramaId = null }) => {
  // Hooks de estado y funcionalidades
  const editorState = useEditorState(estructuraInicial);
  const history = useDiagramHistory();
  const persistence = useDiagramPersistence(editorState, history, projectId, diagramaId);
  const dragDrop = useDiagramDragAndDrop(editorState, history);
  const edgeManagement = useEdgeManagement(editorState, history, persistence);
  const contextMenu = useContextMenu(editorState, history, edgeManagement, persistence);
  const debounceTimeout = useRef(null);

  console.log('EditorDiagrama - estructuraInicial recibida:', estructuraInicial);

  // Efecto para limpiar notificaciones automáticamente
  useEffect(() => {
    if (persistence.notificacion) {
      const timer = setTimeout(() => {

        persistence.limpiarNotificacion();
      }, 4000);//
      return () => clearTimeout(timer);
    }
  }, [persistence.notificacion, persistence.limpiarNotificacion]);

  // Handler para guardar con atajo de teclado
  const manejarAtajoTeclado = useCallback((event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      persistence.manejarGuardadoDiagrama();
    }
  }, [persistence]);

  // Registrar listener de teclado
  useEffect(() => {
    document.addEventListener('keydown', manejarAtajoTeclado);
    return () => document.removeEventListener('keydown', manejarAtajoTeclado);
  }, [manejarAtajoTeclado]);

  // Efecto para guardado automático
  useEffect(() => {
  

    // Log para ver si la validación permite guardar
    

    if (!editorState.isLoading && persistence.validarDiagrama()) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        console.log('Guardado automático disparado');
        console.log('Nodos enviados al guardar:', editorState.nodes);
        console.log('Relaciones enviadas al guardar:', editorState.edges);
        handleGuardarDiagramaCompleto(); // Usa la misma función que el Toolbar
      }, 1500);
    }
    return () => clearTimeout(debounceTimeout.current);
  }, [editorState.nodes, editorState.edges, editorState.isLoading, persistence]);

  useEffect(() => {
    console.log('EditorDiagrama - nodos actuales:', editorState.nodes);
    console.log('EditorDiagrama - relaciones actuales:', editorState.edges);
  }, [editorState.nodes, editorState.edges]);

  if (editorState.isLoading) {
    return (
      <div className="cargando-editor flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando editor de diagramas...</p>
        </div>
      </div>
    );
  }

  const nodeTypes = {
    claseNode: ClaseNodeRF
  };

  const handleGuardarRelaciones = () => {
    const relaciones = editorState.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: edge.target,
      targetHandle: edge.targetHandle,
      tipo: edge.data?.tipo,
      multiplicidadSource: edge.data?.multiplicidadSource,
      multiplicidadTarget: edge.data?.multiplicidadTarget,
      label: edge.data?.label,
    }));

    persistence.persistirRelaciones(relaciones);
    console.log('Relaciones guardadas:', relaciones);
  };

  const handleGuardarDiagramaCompleto = () => {
    const nodos = editorState.nodes.map(nodo => ({
      id: nodo.id,
      type: nodo.type,
      position: nodo.position,
      data: nodo.data
    }));

    const relaciones = editorState.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: edge.target,
      targetHandle: edge.targetHandle,
      tipo: edge.data?.tipo,
      multiplicidadSource: edge.data?.multiplicidadSource,
      multiplicidadTarget: edge.data?.multiplicidadTarget,
      label: edge.data?.label,
    }));

    persistence.persistirDiagrama({ nodos, relaciones });
    console.log('Diagrama guardado:', { nodos, relaciones });
  };

  return (
    <div className="editor-diagrama-container relative" style={{ height: '100%' }}>
      {/* Toolbar agregado aquí */}
      <Toolbar
        handleGuardarRelaciones={handleGuardarRelaciones}
        onAgregarClase={() => {/* lógica para agregar clase */}}
        onAgregarRelacion={() => {/* lógica para agregar relación */}}
      />

      {/* Controles del editor */}
      <DiagramControls
        onUndo={history.undo}
        onRedo={history.redo}
        onGuardar={persistence.manejarGuardadoDiagrama}
        puedeDeshacer={history.canUndo}
        puedeRehacer={history.canRedo}
        guardando={persistence.estaGuardando}
      />

      {/* Canvas principal */}
      <DiagramCanvas
        editorState={editorState}
        dragDrop={dragDrop}
        edgeManagement={edgeManagement}
        contextMenu={contextMenu}
        onReactFlowInit={dragDrop.onReactFlowInit}
        nodeTypes={nodeTypes}
      />
      
      {/* Gestor de modales y menús */}
      <ModalsManager
        claseEditando={persistence.claseEditando}
        onGuardarClase={(claseActualizada) => {
          console.log('Antes de actualizar nodos:', editorState.nodes);
          editorState.setNodes((nodosPrevios) =>
            nodosPrevios.map(nodo =>
              nodo.id === claseActualizada.id
                ? { ...nodo, data: { ...nodo.data, ...claseActualizada } }
                : nodo
            )
          );
          setTimeout(() => {
            console.log('Después de actualizar nodos:', editorState.nodes);
          }, 500); // Da tiempo a React para actualizar el estado

          handleGuardarDiagramaCompleto();
          persistence.manejarGuardarClase(claseActualizada);
          persistence.setClaseEditando(null);
        }}
        onCancelar={() => {
          persistence.setClaseEditando(null);           // Cierra modal de clase
          edgeManagement.setRelacionEditando(null);     // Cierra modal de relación
        }}
        relacionEditando={edgeManagement.relacionEditando}
        onGuardarRelacion={(relacionActualizada) => {
          console.log('[EditorDiagrama] Relación actualizada:', relacionActualizada);

          // Si es association_class, agrega el nodo y los edges correspondientes
          if (
            relacionActualizada.data?.tipo === TIPOS_RELACION.ASSOCIATION_CLASS &&
            relacionActualizada.data?.claseAsociacion
          ) {
            // 1. Agregar el nodo de clase intermedia si no existe
            editorState.setNodes((nodosPrevios) => {
              const existe = nodosPrevios.some(n => n.id === relacionActualizada.data.claseAsociacion.id);
              if (!existe) {
                // Calcula posición entre source y target
                const sourceNode = nodosPrevios.find(n => n.id === relacionActualizada.source);
                const targetNode = nodosPrevios.find(n => n.id === relacionActualizada.target);
                const posX = sourceNode && targetNode
                  ? (sourceNode.position.x + targetNode.position.x) / 2
                  : 100;
                const posY = sourceNode && targetNode
                  ? ((sourceNode.position.y + targetNode.position.y) / 2) + 80 // offset hacia abajo
                  : 180;
                return [
                  ...nodosPrevios,
                  {
                    id: relacionActualizada.data.claseAsociacion.id,
                    type: 'claseNode', // O 'associationClassNode' si tienes un tipo específico
                    position: { x: posX, y: posY },
                    data: relacionActualizada.data.claseAsociacion
                  }
                ];
              }
              return nodosPrevios;
            });

            // 2. Crear edges desde origen → clase intermedia y clase intermedia → destino
            editorState.setEdges((edgesPrevios) => {
              // Elimina el edge original
              const edgesFiltrados = edgesPrevios.filter(edge => edge.id !== relacionActualizada.id);

              // Crea dos nuevos edges con tipo recto y estilo de association_class
              const edgeA = {
                id: `${relacionActualizada.source}-${relacionActualizada.data.claseAsociacion.id}`,
                source: relacionActualizada.source,
                target: relacionActualizada.data.claseAsociacion.id,
                type: 'straight', // ← Línea recta
                data: { tipo: TIPOS_RELACION.ASSOCIATION_CLASS }
              };
              const edgeB = {
                id: `${relacionActualizada.data.claseAsociacion.id}-${relacionActualizada.target}`,
                source: relacionActualizada.data.claseAsociacion.id,
                target: relacionActualizada.target,
                type: 'straight', // ← Línea recta
                data: { tipo: TIPOS_RELACION.ASSOCIATION_CLASS }
              };
              return [...edgesFiltrados, edgeA, edgeB];
            });

            edgeManagement.setRelacionEditando(null); // Cierra el modal
            return; // No actualices el edge original
          }

          // Si no es association_class, actualiza el edge normalmente
          editorState.setEdges((edgesPrevios) =>
            edgesPrevios.map(edge =>
              edge.id === relacionActualizada.id
                ? { ...edge, ...relacionActualizada }
                : edge
            )
          );
          handleGuardarDiagramaCompleto(); // ← Añade esto
          edgeManagement.setRelacionEditando(null); // Cierra el modal
        }}
        contextMenu={contextMenu}
        contextMenuActions={contextMenu.accionesContextMenu}
        nodos={editorState.nodes} // ← Agrega esta prop
      />
      
      {/* Notificaciones toast */}
      <ToastNotifications 
        notificacion={persistence.notificacion} 
        onCerrar={persistence.limpiarNotificacion}
      />
    </div>
  );
};

export default EditorDiagrama;