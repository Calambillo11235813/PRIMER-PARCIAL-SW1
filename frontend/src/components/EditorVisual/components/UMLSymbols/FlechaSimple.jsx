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

  return (
    <polygon
      points={pointsStr}
      fill="#333333"
      stroke="#333333"
      strokeWidth={2}
    />
  );
};