import React from 'react';

export const FlechaSimple = ({ x, y, angle, size }) => {
  const points = [
    { x: -size * 2, y: -size },
    { x: 0, y: 0 },
    { x: -size * 2, y: size }
  ].map(p => ({
    x: p.x * Math.cos(angle) - p.y * Math.sin(angle) + x,
    y: p.x * Math.sin(angle) + p.y * Math.cos(angle) + y
  }));

  const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');

  // Flecha simple: verde con borde blanco
  return (
    <polygon
      points={pointsStr}
      fill="#22c55e"      // verde tailwind-500
      stroke="#fff"       // borde blanco
      strokeWidth={2}
    />
  );
};