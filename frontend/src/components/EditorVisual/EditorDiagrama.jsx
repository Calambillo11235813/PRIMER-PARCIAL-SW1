// EditorDiagrama.jsx
import React, { useEffect, useCallback } from 'react';
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

  // Efecto para limpiar notificaciones automáticamente
  useEffect(() => {
    if (persistence.notificacion) {
      const timer = setTimeout(() => {
        persistence.limpiarNotificacion();
      }, 4000);
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
          editorState.setNodes((nodosPrevios) =>
            nodosPrevios.map(nodo =>
              nodo.id === claseActualizada.id
                ? { ...nodo, data: { ...nodo.data, ...claseActualizada } }
                : nodo
            )
          );
          persistence.manejarGuardarClase(claseActualizada);
          persistence.setClaseEditando(null);
        }}
        onCancelar={() => {
          persistence.setClaseEditando(null);           // Cierra modal de clase
          edgeManagement.setRelacionEditando(null);     // Cierra modal de relación
        }}
        relacionEditando={edgeManagement.relacionEditando}
        onGuardarRelacion={edgeManagement.handleGuardarRelacion}
        contextMenu={contextMenu}
        contextMenuActions={contextMenu.accionesContextMenu}
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