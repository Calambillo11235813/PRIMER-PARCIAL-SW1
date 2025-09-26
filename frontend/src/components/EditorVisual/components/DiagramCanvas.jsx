// components/DiagramCanvas.jsx
import React, { useMemo } from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import ClaseNodeRF from '../ClaseNodeRF'; // Debe ser ClaseNodeRF, no ClaseNode
import RelacionNode from '../RelacionNode';
import { RelationshipLine } from './RelationshipLine';
import { TIPOS_RELACION } from '../constants/umlTypes';

/**
 * Componente principal del canvas de React Flow
 * 
 * @param {Object} props
 * @param {Object} props.editorState - Estado del editor
 * @param {Object} props.dragDrop - Funciones de drag & drop
 * @param {Object} props.edgeManagement - Gestión de relaciones
 * @param {Object} props.contextMenu - Menú contextual
 * @param {Function} props.onReactFlowInit - Callback de inicialización
 * @returns {JSX.Element} Canvas del diagrama
 */
const DiagramCanvas = ({
  editorState,
  dragDrop,
  edgeManagement,
  contextMenu,
  onReactFlowInit
}) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange
  } = editorState;


  const {
    reactFlowWrapper,
    handleDragOver,
    handleDrop
  } = dragDrop;

  const {
    edgeTypes,
    connectionLineTypeProp
  } = edgeManagement;

  const {
    handleNodeContextMenu,
    handleEdgeContextMenu,
    closeContextMenu,
    contextMenu: menuContexto
  } = contextMenu;

  // Tipos de nodos memoizados
  const nodeTypes = useMemo(() => ({
    claseNode: ClaseNodeRF,
   
  }), []);

  // Handlers de interacción con nodos
  const handleNodeClick = (event, node) => {
    if (menuContexto.visible) {
      closeContextMenu();
    }
  };

  const edgeTypesLocal = useMemo(() => ({
    ...edgeTypes,
    relacionNode: RelacionNode // ← Asegura que el tipo esté presente
  }), [edgeTypes]);

  const handleNodeDoubleClick = (event, node) => {
    event.preventDefault();
    event.stopPropagation();
    contextMenu.accionesContextMenu.editarNodo(node);
  };

  // Reemplaza la referencia a onConnect por esta función personalizada:
  const handleConnect = (params) => {
    const tipoRelacion = params.source === params.target
      ? TIPOS_RELACION.RECURSIVA
      : TIPOS_RELACION.ASOCIACION;

    editorState.setEdges((eds) => [
      ...eds,
      {
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'relacionNode',
        data: { tipo: tipoRelacion }
      }
    ]);
  };

  return (
    <div
      className="editor-canvas-wrapper"
      style={{ height: '100%', background: '#fff' }}
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect} // ← Usa la función personalizada
        onInit={onReactFlowInit}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypesLocal}
        connectionLineType={connectionLineTypeProp}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        fitView
        connectionRadius={20}
      >
        <Controls
          position="top-right"
          showInteractive={false}
        />
        <Background
          gap={24}
          color="#e5e7eb"
          variant="lines"
        />
      </ReactFlow>
    </div>
  );
};

export default DiagramCanvas;