// src/components/EditorVisual/components/UMLSymbols/UMLSymbols.jsx
import React from 'react';
import { RomboUML } from './RomboUML';
import { TrianguloUML } from './TrianguloUML';
import { FlechaSimple } from './FlechaSimple';

/**
 * Renderiza el símbolo UML correspondiente según el tipo de relación.
 * 
 * @param {Array} localPoints - Puntos de la línea de relación.
 * @param {Function} getRenderedPoint - Función para obtener coordenadas renderizadas.
 * @param {string} tipoRelacion - Tipo de relación UML (composicion, agregacion, herencia, etc.).
 */
export const UMLSymbols = ({ localPoints, getRenderedPoint, tipoRelacion }) => {
  const len = localPoints.length;
  if (len < 2) return null;

  const sourcePoint = getRenderedPoint(localPoints[0], 0, len);
  const targetPoint = getRenderedPoint(localPoints[len - 1], len - 1, len);

  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  const angle = Math.atan2(dy, dx);

  const renderizarSimbolo = () => {
    switch (tipoRelacion) {
      case 'composicion':
        return <RomboUML x={targetPoint.x} y={targetPoint.y} angle={angle} filled size={12} />;
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

  return renderizarSimbolo();
};
