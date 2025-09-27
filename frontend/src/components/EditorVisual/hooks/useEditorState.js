// hooks/useEditorState.js
import { useNodesState, useEdgesState } from '@xyflow/react';
import { useEffect, useState } from 'react';

export const useEditorState = (estructuraInicial) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {


    // Si la estructura tiene nodos, inicialízalos directamente
    if (estructuraInicial?.nodos) {
      setNodes(estructuraInicial.nodos);

    } else if (estructuraInicial?.clases) {
      const initialNodes = estructuraInicial.clases.map((clase, idx) => {
        // Si no hay posición, asigna una por defecto y avisa por consola
        if (!clase.position) {
          console.warn(`Clase sin posición encontrada (idx=${idx}, nombre=${clase.nombre}). Asignando posición por defecto.`);
        }
        return {
          id: clase.id || `node-${idx}`,
          type: 'claseNode',
          position: clase.position || { x: 100 + idx * 200, y: 100 },
          data: { ...clase, label: clase.nombre || `Clase ${idx + 1}` }
        };
      });
      console.log('Inicializando nodos (con posición):', initialNodes); // DEPURACIÓN
      setNodes(initialNodes);

      // Agrega un edge de prueba para visualizar una relación
      setEdges([
        {
          id: 'edge-test',
          source: initialNodes[0]?.id,
          sourceHandle: 'top',
          target: initialNodes[1]?.id,
          targetHandle: 'bottom',
          type: 'relacionNode',
          data: {
            tipo: 'asociacion',
            multiplicidadSource: '1',
            multiplicidadTarget: 'N',
            label: 'Test'
          }
        }
      ]);
    }

    if (estructuraInicial?.relaciones) {
      const initialEdges = estructuraInicial.relaciones
        .filter(r => r.sourceHandle && r.targetHandle)
        .map((r, idx) => ({
          id: r.id || `edge-${idx}`,
          source: r.source,
          sourceHandle: r.sourceHandle,
          target: r.target,
          targetHandle: r.targetHandle,
          type: 'relacionNode',
          data: {
            tipo: r.tipo || 'asociacion',
            multiplicidadSource: r.multiplicidadSource || '1',
            multiplicidadTarget: r.multiplicidadTarget || 'N',
            label: r.label || null,
          },
        }));



      setEdges(initialEdges);
    }

    setIsLoading(false);
  }, [estructuraInicial, setNodes, setEdges]);

  // Refuerza el filtrado cada vez que se actualicen los edges
  useEffect(() => {
    setEdges((eds) =>
      eds.filter(e =>
        // Solo filtra si el edge es de tipo relacionNode y no es association_class
        e.type !== 'relacionNode' || e.data?.tipo !== 'association_class' || (e.sourceHandle && e.targetHandle)
      )
    );
  }, [edges, setEdges]);

  // Agrega un efecto para depurar cambios en los nodos
  useEffect(() => {
    // Log para depuración: nodos actualizados

  }, [nodes]);

  useEffect(() => {
    // Log para depuración: edges actualizados

  }, [edges]);

  return {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    isLoading
  };
};