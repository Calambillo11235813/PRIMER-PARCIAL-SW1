// src/components/EditorVisual/components/UMLSymbols/index.jsx
export { RomboUML } from './RomboUML';
export { TrianguloUML } from './TrianguloUML';
export { FlechaSimple } from './FlechaSimple';

// Componente principal que agrupa todos los símbolos
import React from 'react';
import { RomboUML } from './RomboUML';
import { TrianguloUML } from './TrianguloUML';
import { FlechaSimple } from './FlechaSimple';

/**
 * Renderiza el símbolo UML correspondiente según el tipo de relación.
 * Para asociación, NO renderiza ningún símbolo (solo línea simple).
 * Los símbolos se dibujan con un pequeño offset para no quedar pegados al nodo destino.
 */
export const UMLSymbols = ({ localPoints, getRenderedPoint, tipoRelacion }) => {
  const len = localPoints.length;
  if (len < 2) return null;

  const sourcePoint = getRenderedPoint(localPoints[0], 0, len);
  const targetPoint = getRenderedPoint(localPoints[len - 1], len - 1, len);

  // Calcular ángulo de la flecha
  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  const angle = Math.atan2(dy, dx);

  // Offset para separar el símbolo del nodo destino
  const OFFSET = 16;
  const offsetX = targetPoint.x - Math.cos(angle) * OFFSET;
  const offsetY = targetPoint.y - Math.sin(angle) * OFFSET;

  // Renderizar símbolo según el tipo de relación
  switch (tipoRelacion) {
    case 'composicion':
      return <RomboUML x={offsetX} y={offsetY} angle={angle} filled={true} size={12} />;
    case 'agregacion':
      return <RomboUML x={offsetX} y={offsetY} angle={angle} filled={false} size={12} />;
    case 'herencia':
     return <FlechaSimple x={offsetX} y={offsetY} angle={angle} size={16} />;
    case 'realizacion':
      return <TrianguloUML x={offsetX} y={offsetY} angle={angle} filled={false} size={10} />;
    case 'dependencia':
      return <FlechaSimple x={offsetX} y={offsetY} angle={angle} size={8} />;
    case 'asociacion':
      return null; // ← Asociación: solo línea simple, sin flecha
    default:
      return null;
  }
};