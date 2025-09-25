import React from 'react';

/**
 * Flecha recursiva inteligente que se adapta a la posición del handle
 */
export const FlechaRecursiva = ({ x, y, size = 100, color = '#22c55e', handleId }) => {
  // Determinar dirección basada en el handle usado
  const getDirection = (handleId) => {
    if (!handleId) return 'right'; // Por defecto a la derecha
    
    const parts = handleId.split('-');
    const position = parts[2]; // "right", "left", "top", "bottom"
    
    switch (position) {
      case 'left': return 'left';
      case 'top': return 'top'; 
      case 'bottom': return 'bottom';
      default: return 'right';
    }
  };

  const direction = getDirection(handleId);
  
  // Configuración basada en dirección
  let startX, startY, cp1X, cp1Y, cp2X, cp2Y, endX, endY;
  let arrowSize = 12;

  switch (direction) {
    case 'right':
      startX = x + 20;
      startY = y;
      cp1X = startX + size * 0.8;
      cp1Y = startY - size * 0.6;
      cp2X = startX + size * 0.8;
      cp2Y = startY + size * 0.6;
      endX = startX;
      endY = startY + size;
      break;
      
    case 'left':
      startX = x - 20;
      startY = y;
      cp1X = startX - size * 0.8;
      cp1Y = startY - size * 0.6;
      cp2X = startX - size * 0.8;
      cp2Y = startY + size * 0.6;
      endX = startX;
      endY = startY + size;
      break;
      
    case 'top':
      startX = x;
      startY = y - 20;
      cp1X = startX - size * 0.6;
      cp1Y = startY - size * 0.8;
      cp2X = startX + size * 0.6;
      cp2Y = startY - size * 0.8;
      endX = startX + size;
      endY = startY;
      break;
      
    case 'bottom':
      startX = x;
      startY = y + 20;
      cp1X = startX - size * 0.6;
      cp1Y = startY + size * 0.8;
      cp2X = startX + size * 0.6;
      cp2Y = startY + size * 0.8;
      endX = startX + size;
      endY = startY;
      break;
  }

  // Flecha (depende de la dirección)
  let arrowPoints;
  if (direction === 'right' || direction === 'left') {
    const arrowOffset = direction === 'right' ? -arrowSize : arrowSize;
    arrowPoints = `
      ${endX},${endY} 
      ${endX + arrowOffset},${endY - arrowSize} 
      ${endX + arrowOffset},${endY + arrowSize}
    `;
  } else {
    const arrowOffset = direction === 'top' ? arrowSize : -arrowSize;
    arrowPoints = `
      ${endX},${endY} 
      ${endX - arrowSize},${endY + arrowOffset} 
      ${endX + arrowSize},${endY + arrowOffset}
    `;
  }

  return (
    <g>
      <path
        d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
      />
      <polygon
        points={arrowPoints}
        fill={color}
      />
    </g>
  );
};