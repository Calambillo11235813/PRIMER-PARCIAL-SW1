// src/components/EditorVisual/components/UMLSymbols/index.jsx
export { RomboUML } from './RomboUML';
export { TrianguloUML } from './TrianguloUML';
export { FlechaSimple } from './FlechaSimple';

// Componente principal que agrupa todos los símbolos
import React from 'react';
import { RomboUML } from './RomboUML';
import { TrianguloUML } from './TrianguloUML';
import { FlechaSimple } from './FlechaSimple';

export const UMLSymbols = ({ localPoints, getRenderedPoint, tipoRelacion }) => {
  const len = localPoints.length;
  if (len < 2) return null;

  const sourcePoint = getRenderedPoint(localPoints[0], 0, len);
  const targetPoint = getRenderedPoint(localPoints[len - 1], len - 1, len);

  // Calcular ángulo de la flecha
  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  const angle = Math.atan2(dy, dx);

  // Renderizar símbolo según el tipo de relación
  switch (tipoRelacion) {
    case 'composicion':
      return <RomboUML x={targetPoint.x} y={targetPoint.y} angle={angle} filled={true} size={12} />;
    
    case 'agregacion':
      return <RomboUML x={targetPoint.x} y={targetPoint.y} angle={angle} filled={false} size={12} />;
    
    case 'herencia':
    case 'realizacion':
      return <TrianguloUML x={targetPoint.x} y={targetPoint.y} angle={angle} filled={false} size={10} />;
    
    case 'dependencia':
    case 'asociacion':
    default:
      return <FlechaSimple x={targetPoint.x} y={targetPoint.y} angle={angle} size={8} />;
  }
};