import React from 'react';
import { ESTILOS_RELACION } from '../constants/styling';
import { TIPOS_RELACION } from '../constants/umlTypes';

export const RelationshipLine = ({ pointsStr, tipoRelacion }) => {
  const estiloLinea = ESTILOS_RELACION[tipoRelacion] || ESTILOS_RELACION[TIPOS_RELACION.ASOCIACION];

  // Solo agrega markerEnd si el tipo NO es asociación
  const markerEndProp =
    tipoRelacion === TIPOS_RELACION.ASOCIACION ? {} : { markerEnd: 'url(#arrowhead)' };

  return (
    <>
      <polyline
        points={pointsStr}
        fill="none"
        stroke="rgba(0,0,0,0.01)"
        strokeWidth={20}
        style={{ pointerEvents: 'stroke', cursor: 'context-menu' }}
      />
      <polyline
        points={pointsStr}
        fill="none"
        stroke={estiloLinea.stroke}
        strokeWidth={estiloLinea.strokeWidth}
        strokeDasharray={estiloLinea.strokeDasharray}
        style={{ pointerEvents: 'none' }}
        {...markerEndProp} // ← Solo para tipos que lo requieran
      />
    </>
  );
};