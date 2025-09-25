import React from 'react';


/**
 * Línea específica para la clase intermedia (association class).
 * Props:
 *  - x1, y1: coordenadas de inicio
 *  - x2, y2: coordenadas de fin
 */
export const LineaClaseAsociacion = ({ x1, y1, x2, y2 }) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke="#22c55e"
    strokeWidth={2}
    strokeDasharray="6,4" // Línea punteada
    markerEnd="url(#arrowhead)" // Opcional: flecha al final
  />
);