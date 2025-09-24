import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EdgeLabelRenderer } from '@xyflow/react'; // ajustar si usas otro paquete

const RelacionNode = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
  // data.points puede venir desde el edge (persistido) o undefined
  const initialPoints = data?.points || null;
  const layout = data?.layout || null;

  // Función utilitaria: calcular puntos ortogonales simples
  const calcularOrtogonal = useCallback((sx, sy, tx, ty) => {
    const midX = Math.round((sx + tx) / 2);
    return [
      { x: Math.round(sx), y: Math.round(sy) },
      { x: midX, y: Math.round(sy) },
      { x: midX, y: Math.round(ty) },
      { x: Math.round(tx), y: Math.round(ty) }
    ];
  }, []);

  // Inicializar localPoints sin provocar loop
  const buildInitial = useCallback(() => {
    if (initialPoints && initialPoints.length) return initialPoints.map(p => ({ x: p.x, y: p.y }));
    if (layout === 'orthogonal') return calcularOrtogonal(sourceX, sourceY, targetX, targetY);
    return [{ x: Math.round(sourceX), y: Math.round(sourceY) }, { x: Math.round(targetX), y: Math.round(targetY) }];
  }, [initialPoints, layout, calcularOrtogonal, sourceX, sourceY, targetX, targetY]);

  const [localPoints, setLocalPoints] = useState(() => buildInitial());
  const localPointsRef = useRef(localPoints);
  useEffect(() => { localPointsRef.current = localPoints; }, [localPoints]);

  // Sincronizar solo si realmente cambian (evita update loops)
  useEffect(() => {
    const incoming = buildInitial();
    const equal = JSON.stringify(incoming) === JSON.stringify(localPointsRef.current);
    if (!equal) {
      setLocalPoints(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPoints, layout, sourceX, sourceY, targetX, targetY]);

  // Construir string para polyline
  const pointsStr = useMemo(() => localPoints.map(p => `${p.x},${p.y}`).join(' '), [localPoints]);

  // Emitir la actualización final de puntos (uso 'id' en detail para compatibilidad)
  const emitPointsChange = useCallback((pts) => {
    const ev = new CustomEvent('edge-points-change', { detail: { id, points: pts } });
    window.dispatchEvent(ev);
  }, [id]);

  // Drag de handle con Pointer Events (más robusto que mouse events)
  const startHandlePointerDrag = (index) => (e) => {
    e.stopPropagation();
    const targetEl = e.target;
    const pointerId = e.pointerId;

    // Obtener rect del wrapper (coordenadas del canvas en el DOM)
    const rect = (window.getReactFlowWrapperRect && window.getReactFlowWrapperRect()) || { left: 0, top: 0 };

    // proyectar la posición inicial del puntero
    const startClientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0]?.clientX) || 0;
    const startClientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0]?.clientY) || 0;
    const relStartX = startClientX - rect.left;
    const relStartY = startClientY - rect.top;

    const projectedStart = (window.reactFlowInstance && typeof window.reactFlowInstance.project === 'function')
      ? window.reactFlowInstance.project({ x: relStartX, y: relStartY })
      : { x: relStartX, y: relStartY };

    // calcular offset entre punto actual y posición proyectada del puntero
    const currentPoint = localPointsRef.current[index] || { x: projectedStart.x, y: projectedStart.y };
    const offsetX = currentPoint.x - projectedStart.x;
    const offsetY = currentPoint.y - projectedStart.y;

    try { targetEl.setPointerCapture && targetEl.setPointerCapture(pointerId); } catch (err) { /* no crítico */ }

    const onMove = (evt) => {
      const clientX = (evt.clientX !== undefined) ? evt.clientX : (evt.touches && evt.touches[0]?.clientX) || 0;
      const clientY = (evt.clientY !== undefined) ? evt.clientY : (evt.touches && evt.touches[0]?.clientY) || 0;
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const projected = (window.reactFlowInstance && typeof window.reactFlowInstance.project === 'function')
        ? window.reactFlowInstance.project({ x: relX, y: relY })
        : { x: relX, y: relY };

      // aplicar offset para evitar salto inicial
      const targetX = Math.round(projected.x + offsetX);
      const targetY = Math.round(projected.y + offsetY);

      setLocalPoints(prev => {
        const next = prev.map(p => ({ x: p.x, y: p.y }));
        next[index] = { x: targetX, y: targetY };
        return next;
      });
    };

    const onUp = () => {
      try { targetEl.releasePointerCapture && targetEl.releasePointerCapture(pointerId); } catch (err) { /* no crítico */ }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      // notificar con snapshot más reciente
      emitPointsChange(localPointsRef.current);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Render handles intermedios usando pointerdown (ya presente)
  const intermediateHandles = localPoints.slice(1, -1).map((p, idx) => {
    const handleIndex = idx + 1;
    return (
      <rect
        key={`handle-${handleIndex}`}
        x={p.x - 6}
        y={p.y - 6}
        width={12}
        height={12}
        fill="#fff"
        stroke="#0b8a3e"
        strokeWidth={1.5}
        style={{ cursor: 'grab', pointerEvents: 'all' }}
        onPointerDown={startHandlePointerDrag(handleIndex)}
      />
    );
  });

  console.debug && console.debug('[RelacionNode] id, sourceX, sourceY, targetX, targetY, data.layout ->', id, sourceX, sourceY, targetX, targetY, data?.layout);

  return (
    <>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'auto' }}>
        {/* zona de impacto amplia */}
        <polyline points={pointsStr} fill="none" stroke="rgba(0,0,0,0.01)" strokeWidth={12} style={{ pointerEvents: 'stroke', cursor: 'context-menu' }} />
        {/* linea visible */}
        <polyline points={pointsStr} fill="none" stroke={data?.stroke || '#333'} strokeWidth={data?.strokeWidth || 2} strokeDasharray={data?.strokeDasharray} style={{ pointerEvents: 'none' }} />
        {/* handles (solo si más de 2 puntos) */}
        <g style={{ pointerEvents: 'all' }}>
          {intermediateHandles}
        </g>
      </svg>

      <EdgeLabelRenderer>
        {/* labels si aplican */}
      </EdgeLabelRenderer>
    </>
  );
};

export default RelacionNode;