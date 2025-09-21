import React, { useCallback, useEffect, useState } from 'react';
import { ReactFlow, addEdge, useEdgesState, useNodesState, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ClaseNodeRF from './ClaseNodeRF.jsx';  // Agrega .jsx
import Sidebar from './Sidebar';
import EditarClaseModal from './EditarClaseModal';

const nodeTypes = { claseNode: ClaseNodeRF };

const EditorDiagrama = ({ estructuraInicial, onGuardar }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [claseEditando, setClaseEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial
  useEffect(() => {
    console.log('DEBUG: useEffect ejecutado. estructuraInicial:', estructuraInicial);  // Log inicial

    if (estructuraInicial?.clases) {
      const initialNodes = estructuraInicial.clases.map((clase, idx) => ({
        id: `node-${idx}`,
        type: 'claseNode',
        position: { x: 100 + idx * 200, y: 100 },
        data: clase
      }));
      setNodes(initialNodes);
      console.log('DEBUG: Nodos iniciales cargados desde estructuraInicial. Total:', initialNodes.length);
    } else {
      console.warn('No hay estructura inicial; editor vacío.');
    }

    setIsLoading(false);
    console.log('DEBUG: Estado de carga actualizado a false.');  // Confirma cambio de estado

  }, [estructuraInicial, setNodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleDrop = (event) => {
    event.preventDefault();
    const tipoElemento = event.dataTransfer.getData('tipoElemento');
    console.log('DEBUG: handleDrop llamado con tipoElemento:', tipoElemento);  // Log para debug

    if (tipoElemento === 'Clase' || tipoElemento === 'Interface') {
      const newNode = {
        id: `node-${Date.now()}`,
        type: 'claseNode',
        position: { x: event.clientX - 200, y: event.clientY - 100 },  // Ajusta posición
        data: {
          nombre: tipoElemento === 'Clase' ? 'NuevaClase' : 'NuevaInterface',
          atributos: [],
          metodos: [],
          esAbstracta: tipoElemento === 'Interface'
        }
      };
      setNodes((nds) => nds.concat(newNode));
    }
  };

  const handleNodeClick = (event, node) => {
    setClaseEditando(node);
    setModalAbierto(true);
  };

  const handleGuardarClase = (claseActualizada) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === claseEditando.id ? { ...n, data: claseActualizada } : n))
    );
    setModalAbierto(false);
    setClaseEditando(null);
  };

  return (
    <div className="flex">
      <Sidebar onDragStart={(e, tipo) => e.dataTransfer.setData('tipoElemento', tipo)} />
      <div style={{ height: '500px', width: '100%' }} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
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
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        )}
      </div>
      {modalAbierto && (
        <EditarClaseModal
          clase={claseEditando?.data}
          onGuardar={handleGuardarClase}
          onCancelar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};

export default EditorDiagrama;

