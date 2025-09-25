import React from 'react';

/**
 * Dibuja una línea simple para asociación UML (sin flecha ni símbolo).
 */
export const AsociacionSimple = ({ x1, y1, x2, y2, stroke = "#333", strokeWidth = 2 }) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={stroke}
    strokeWidth={strokeWidth}
  />
);