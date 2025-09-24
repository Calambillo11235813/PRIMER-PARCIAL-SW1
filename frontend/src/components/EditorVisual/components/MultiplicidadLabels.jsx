import React, { useMemo } from 'react';

export const MultiplicidadLabels = ({ localPoints, getRenderedPoint, data }) => {
  const calcularPosicionLabels = useMemo(() => {
    const len = localPoints.length;
    if (len < 2) return { source: null, target: null };

    const sourcePoint = getRenderedPoint(localPoints[0], 0, len);
    const targetPoint = getRenderedPoint(localPoints[len - 1], len - 1, len);

    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);
    if (distancia === 0) return { source: null, target: null };

    const ux = dx / distancia;
    const uy = dy / distancia;
    const offsetPerpendicular = 15;
    const perpendicularX = -uy * offsetPerpendicular;
    const perpendicularY = ux * offsetPerpendicular;

    const labelOffset = 30; // DISTANCIA_LABEL_CLASE + 10
    return {
      source: {
        x: sourcePoint.x + ux * labelOffset + perpendicularX,
        y: sourcePoint.y + uy * labelOffset + perpendicularY
      },
      target: {
        x: targetPoint.x - ux * labelOffset + perpendicularX,
        y: targetPoint.y - uy * labelOffset + perpendicularY
      }
    };
  }, [localPoints, getRenderedPoint]);

  const posiciones = calcularPosicionLabels;
  if (!posiciones.source || !posiciones.target) return null;

  return (
    <>
      {data?.multiplicidadSource && (
        <text x={posiciones.source.x} y={posiciones.source.y} textAnchor="middle" dominantBaseline="middle"
          className="text-xs font-bold fill-gray-800 pointer-events-none"
          style={{ userSelect: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          {data.multiplicidadSource}
        </text>
      )}
      {data?.multiplicidadTarget && (
        <text x={posiciones.target.x} y={posiciones.target.y} textAnchor="middle" dominantBaseline="middle"
          className="text-xs font-bold fill-gray-800 pointer-events-none"
          style={{ userSelect: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          {data.multiplicidadTarget}
        </text>
      )}
    </>
  );
};