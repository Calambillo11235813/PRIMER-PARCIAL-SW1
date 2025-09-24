import React from 'react';

export const RomboUML = ({ x, y, angle, filled, size }) => {
  const points = [
    { x: -size, y: 0 }, { x: 0, y: -size }, 
    { x: size, y: 0 }, { x: 0, y: size }
  ].map(p => ({
    x: p.x * Math.cos(angle) - p.y * Math.sin(angle) + x,
    y: p.x * Math.sin(angle) + p.y * Math.cos(angle) + y
  }));

  const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <polygon
      points={pointsStr}
      fill={filled ? '#333333' : 'white'}
      stroke="#333333"
      strokeWidth={2}
    />
  );
};