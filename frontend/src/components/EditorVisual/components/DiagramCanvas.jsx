// components/DiagramCanvas.jsx
import React, { useMemo } from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import ClaseNodeRF from '../ClaseNodeRF'; // Debe ser ClaseNodeRF, no ClaseNode
import RelacionNode from '../RelacionNode';
import TestNode from '../TestNode'; // Agrega la importación

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

  // Agrega logs para depuración
  

  const {
    reactFlowWrapper,
    handleDragOver,
    handleDrop
  } = dragDrop;

  const {
    onConnect,
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
    testNode: TestNode // Agrega el nuevo tipo
  }), []);

  // Handlers de interacción con nodos
  const handleNodeClick = (event, node) => {
    if (menuContexto.visible) {
      closeContextMenu();
    }
  };

  const handleNodeDoubleClick = (event, node) => {
    event.preventDefault();
    event.stopPropagation();
    contextMenu.accionesContextMenu.editarNodo(node);
  };

  return (
    <div 
      className="editor-canvas-wrapper" 
      style={{ height: '100%' }} 
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onReactFlowInit}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
          gap={16} 
          size={1} 
          color="#f0f0f0"
          variant="dots"
        />
      </ReactFlow>
    </div>
  );
};

export default DiagramCanvas;