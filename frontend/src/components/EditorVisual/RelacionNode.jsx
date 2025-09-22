import React from 'react';
import { BaseEdge, EdgeLabelRenderer } from '@xyflow/react';

/**
 * Edge custom para UML con marcadores:
 * data.tipo: 'asociacion' | 'dependencia' | 'herencia' | 'agregacion' | 'composicion'
 * data.label: multiplicidad / rol
 */
const RelacionNode = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  // Eliminamos onContextMenu de aquí
}) => {
  // Línea recta entre source y target
  const path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;

  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge
        path={path}
        style={{ 
          stroke: '#000', 
          strokeWidth: 2, 
          ...style,
          cursor: 'context-menu' // Solo para indicar que es clickeable
        }}
      />
      
      {/* Etiquetas de multiplicidad */}
      <EdgeLabelRenderer>
        {data?.multiplicidadSource && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + (targetX - sourceX) * 0.25}px, ${sourceY + (targetY - sourceY) * 0.25}px)`,
              background: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '1px solid #ccc',
            }}
            className="edge-label"
          >
            {data.multiplicidadSource}
          </div>
        )}

        {data?.multiplicidadTarget && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX - (targetX - sourceX) * 0.25}px, ${targetY - (targetY - sourceY) * 0.25}px)`,
              background: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '1px solid #ccc',
            }}
            className="edge-label"
          >
            {data.multiplicidadTarget}
          </div>
        )}

        {/* Etiqueta del tipo de relación en el centro */}
        {data?.tipo && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px)`,
              background: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              border: '1px solid #999',
              color: '#333',
            }}
            className="edge-type-label"
          >
            {data.tipo}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default RelacionNode;