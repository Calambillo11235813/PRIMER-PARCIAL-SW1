import React from 'react';
import { ESTILOS_RELACION } from '../constants/styling';

export const RelationshipLine = ({ pointsStr, tipoRelacion }) => {
  const estiloLinea = ESTILOS_RELACION[tipoRelacion] || ESTILOS_RELACION.asociacion;

  return (
    <>
      <polyline points={pointsStr} fill="none" stroke="rgba(0,0,0,0.01)" 
        strokeWidth={20} style={{ pointerEvents: 'stroke', cursor: 'context-menu' }} />
      <polyline points={pointsStr} fill="none" stroke={estiloLinea.stroke}
        strokeWidth={estiloLinea.strokeWidth} strokeDasharray={estiloLinea.strokeDasharray}
        style={{ pointerEvents: 'none' }} />
    </>
  );
};