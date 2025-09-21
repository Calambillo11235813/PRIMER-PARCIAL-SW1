import React from 'react';

/**
 * Edge custom para UML con marcadores:
 * data.tipo: 'asociacion' | 'dependencia' | 'herencia' | 'agregacion' | 'composicion'
 * data.label: multiplicidad / rol
 */
const RelacionNode = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data = {},
}) => {
  // Curva bezier simple
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const controlX = sourceX + deltaX / 2;
  const controlY1 = sourceY;
  const controlY2 = targetY;
  const path = `M ${sourceX},${sourceY} C ${controlX},${controlY1} ${controlX},${controlY2} ${targetX},${targetY}`;

  const tipo = data?.tipo || 'asociacion';
  const markerId = `marker-${tipo}-${id}`;

  // Estilo de linea
  const strokeDash = tipo === 'dependencia' ? '6,3' : '0';

  return (
    <>
      <svg className="react-flow__edge" style={{ overflow: 'visible' }}>
        <defs>
          {/* Flecha simple para asociación (cerrada) */}
          <marker id={markerId} markerUnits="strokeWidth" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
            {tipo === 'herencia' ? (
              // triángulo hueco (generalización)
              <path d="M0,0 L10,5 L0,10 Z" fill="white" stroke="black" />
            ) : tipo === 'agregacion' ? (
              // rombo hueco (agregación)
              <path d="M0,5 L5,0 L10,5 L5,10 Z" fill="white" stroke="black" />
            ) : tipo === 'composicion' ? (
              // rombo sólido (composición)
              <path d="M0,5 L5,0 L10,5 L5,10 Z" fill="black" stroke="black" />
            ) : tipo === 'dependencia' ? (
              // flecha de dependencia (línea punteada con flecha vacía)
              <path d="M0,0 L10,5 L0,10" fill="none" stroke="black" />
            ) : (
              // asociación por defecto: flecha llena
              <path d="M0,0 L10,5 L0,10 Z" fill="black" stroke="black" />
            )}
          </marker>
        </defs>

        <path d={path} fill="none" stroke="black" strokeWidth="1.3" strokeDasharray={strokeDash} markerEnd={`url(#${markerId})`} style={style} />
        {/* Etiqueta cerca del target */}
        {data?.label && (
          <text x={(sourceX + targetX) / 2} y={(sourceY + targetY) / 2 - 6} fontSize="12" fill="#111" textAnchor="middle">
            {data.label}
          </text>
        )}
      </svg>
    </>
  );
};

export default RelacionNode;