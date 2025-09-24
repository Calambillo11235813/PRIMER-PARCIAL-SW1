import { useCallback, useEffect, useRef, useState } from 'react';
import { DISTANCIA_LABEL_CLASE, TAMANO_NODO_CLASE } from '../constants/umlTypes';

export const usePointsManagement = (initialPoints, layout, sourceX, sourceY, targetX, targetY) => {
  const [localPoints, setLocalPoints] = useState([]);
  const localPointsRef = useRef(localPoints);

  const calcularOrtogonal = useCallback((sx, sy, tx, ty) => {
    const midX = Math.round((sx + tx) / 2);
    return [
      { x: Math.round(sx), y: Math.round(sy) },
      { x: midX, y: Math.round(sy) },
      { x: midX, y: Math.round(ty) },
      { x: Math.round(tx), y: Math.round(ty) }
    ];
  }, []);

  const calcularPuntosConOffset = useCallback((sx, sy, tx, ty, layoutType) => {
    const dx = tx - sx;
    const dy = ty - sy;
    const distancia = Math.sqrt(dx * dx + dy * dy);
    
    if (distancia === 0) {
      return [{ x: Math.round(sx), y: Math.round(sy) }, { x: Math.round(tx), y: Math.round(ty) }];
    }
    
    const ux = dx / distancia;
    const uy = dy / distancia;
    const offset = TAMANO_NODO_CLASE / 2 + DISTANCIA_LABEL_CLASE;

    const sourceOffsetX = sx + ux * offset;
    const sourceOffsetY = sy + uy * offset;
    const targetOffsetX = tx - ux * offset;
    const targetOffsetY = ty - uy * offset;

    if (layoutType === 'orthogonal') {
      const midX = Math.round((sourceOffsetX + targetOffsetX) / 2);
      return [
        { x: Math.round(sourceOffsetX), y: Math.round(sourceOffsetY) },
        { x: midX, y: Math.round(sourceOffsetY) },
        { x: midX, y: Math.round(targetOffsetY) },
        { x: Math.round(targetOffsetX), y: Math.round(targetOffsetY) }
      ];
    }

    return [
      { x: Math.round(sourceOffsetX), y: Math.round(sourceOffsetY) },
      { x: Math.round(targetOffsetX), y: Math.round(targetOffsetY) }
    ];
  }, []);

  const buildInitial = useCallback(() => {
    if (initialPoints?.length) {
      return initialPoints.map(p => ({ x: p.x, y: p.y }));
    }
    return calcularPuntosConOffset(sourceX, sourceY, targetX, targetY, layout);
  }, [initialPoints, layout, calcularPuntosConOffset, sourceX, sourceY, targetX, targetY]);

  // Inicialización
  useEffect(() => {
    const puntosIniciales = buildInitial();
    setLocalPoints(puntosIniciales);
    localPointsRef.current = puntosIniciales;
  }, [buildInitial]);

  // Sincronización
  useEffect(() => {
    const incoming = buildInitial();
    const current = localPointsRef.current;
    
    const equal = incoming.length === current.length && 
                  incoming.every((p, i) => p.x === current[i]?.x && p.y === current[i]?.y);
                  
    if (!equal) {
      setLocalPoints(incoming);
      localPointsRef.current = incoming;
    }
  }, [buildInitial]);

  const updatePoints = useCallback((newPoints) => {
    setLocalPoints(newPoints);
    localPointsRef.current = newPoints;
  }, []);

  return {
    localPoints,
    localPointsRef,
    updatePoints,
    setLocalPoints
  };
};