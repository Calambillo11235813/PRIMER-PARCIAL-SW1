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

  // Ref para throttlear logs de movimiento y evitar saturar la consola
  const lastMoveRef = useRef(0);
  
  // UI: estado para feedback del usuario (hover + dragging)
  const [hoverHandle, setHoverHandle] = useState(null); // índice del handle bajo el cursor
  const [draggingHandle, setDraggingHandle] = useState(null); // índice actualmente arrastrado

  // Sincronizar solo si realmente cambian (evita update loops)
  useEffect(() => {
    const incoming = buildInitial();
    const equal = JSON.stringify(incoming) === JSON.stringify(localPointsRef.current);
    if (!equal) {
      setLocalPoints(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPoints, layout, sourceX, sourceY, targetX, targetY]);

  // Helper: obtener punto visible (usar siempre los extremos que provee React Flow)
  const getRenderedPoint = useCallback((p, i, len) => {
    if (i === 0) return { x: Math.round(sourceX), y: Math.round(sourceY) };
    if (i === len - 1) return { x: Math.round(targetX), y: Math.round(targetY) };
    return p;
  }, [sourceX, sourceY, targetX, targetY]);

  // Construir string para polyline usando los endpoints provistos por React Flow
  const pointsStr = useMemo(() => {
    const len = localPoints.length;
    const pts = localPoints.map((p, i) => {
      const rp = getRenderedPoint(p, i, len);
      return `${Math.round(rp.x)},${Math.round(rp.y)}`;
    });
    return pts.join(' ');
  }, [localPoints, getRenderedPoint]);

  // Emitir cambio de endpoint (source/target) con coordenadas en sistema del diagrama
  // Ahora también incluimos clientX/clientY si fueron capturados en el pointer event
  const emitEndpointChange = useCallback((which, projectedPoint, clientX = null, clientY = null) => {
    try {
      const detail = { id, which, point: projectedPoint };
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        detail.clientX = clientX;
        detail.clientY = clientY;
      }
      window.dispatchEvent(new CustomEvent('edge-endpoint-change', { detail }));
      console.debug && console.debug('[RelacionNode][emitEndpointChange] edge=', id, 'which=', which, 'point=', projectedPoint, 'client=', clientX && clientY ? { clientX, clientY } : null);
    } catch (err) {
      console.warn('[RelacionNode] emitEndpointChange error', err);
    }
  }, [id]);

  // Emitir la actualización final de puntos (uso 'id' en detail para compatibilidad)
  const emitPointsChange = useCallback((pts) => {
   console.debug && console.debug(`[RelacionNode][emitPointsChange] edge=${id} points=`, pts);
    const ev = new CustomEvent('edge-points-change', { detail: { id, points: pts } });
    window.dispatchEvent(ev);
  }, [id]);

  // Drag de endpoint (similar a startHandlePointerDrag) pero emite endpoint-change al soltar
  const startEndpointPointerDrag = (which, index) => (e) => {
    // e es PointerEvent — detectamos si el usuario hace un CLICK (sin mover) o inicia un drag
    e.stopPropagation && e.stopPropagation();
    e.preventDefault && e.preventDefault();
    const pointerId = e.pointerId;
    const startClientX = e.clientX || 0;
    const startClientY = e.clientY || 0;
    let moved = false;
    const startTime = Date.now();

    // onMove: marcar moved y emitir move para highlight (mantener comportamiento previo)
    const onMove = (ev) => {
      moved = true;
      const projected = { x: ev.clientX, y: ev.clientY };
      window.dispatchEvent(new CustomEvent('edge-drag-move', { detail: { id, which, index, point: projected, clientX: ev.clientX, clientY: ev.clientY } }));
    };

    const onUp = (ev) => {
      try {
        const finalClientX = ev.clientX || startClientX;
        const finalClientY = ev.clientY || startClientY;
        const dt = Date.now() - startTime;
        // Si no hubo movimiento y fue breve -> interpretar como "click" para asignación rápida
        if (!moved && dt < 300) {
          console.debug && console.debug('[RelacionNode] click detected on endpoint -> requesting assign-mode', { id, which });
          window.dispatchEvent(new CustomEvent('edge-select-for-handle-assign', { detail: { id, which } }));
        } else {
          // Comportamiento normal: emitir cambio final de endpoint con coordenadas cliente
          const finalProjected = { x: finalClientX, y: finalClientY };
          emitEndpointChange(which, finalProjected, finalClientX, finalClientY);
          window.dispatchEvent(new CustomEvent('edge-drag-end', { detail: { id, which, index, point: finalProjected, clientX: finalClientX, clientY: finalClientY } }));
        }
      } finally {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    console.debug && console.debug('[RelacionNode][startEndpointPointerDrag] start edge=', id, 'which=', which, 'index=', index);
  };
 
  // Drag de handle (intermedios) con Pointer Events — evita salto inicial aplicando offset
  const startHandlePointerDrag = (index) => (e) => {
    console.debug && console.debug(`[RelacionNode][startHandlePointerDrag] start edge=${id} index=${index}`);
    // evitar pan/scroll por defecto y burbujeo
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();

    // indicar dragging
    setDraggingHandle(index);

    const targetEl = e.target;
    const pointerId = e.pointerId;

    const rect = (window.getReactFlowWrapperRect && window.getReactFlowWrapperRect()) || { left: 0, top: 0 };
    const startClientX = (e.clientX !== undefined) ? e.clientX : 0;
    const startClientY = (e.clientY !== undefined) ? e.clientY : 0;
    const relStartX = startClientX - rect.left;
    const relStartY = startClientY - rect.top;

    const projectedStart = (window.reactFlowInstance && typeof window.reactFlowInstance.project === 'function')
      ? window.reactFlowInstance.project({ x: relStartX, y: relStartY })
      : { x: relStartX, y: relStartY };

    const currentPoint = localPointsRef.current[index] || { x: projectedStart.x, y: projectedStart.y };
    const offsetX = currentPoint.x - projectedStart.x;
    const offsetY = currentPoint.y - projectedStart.y;

    let usingCapture = false;
    try { targetEl.setPointerCapture && targetEl.setPointerCapture(pointerId); usingCapture = true; } catch (err) { usingCapture = false; }

    const onMove = (evt) => {
      const clientX = (evt.clientX !== undefined) ? evt.clientX : 0;
      const clientY = (evt.clientY !== undefined) ? evt.clientY : 0;
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const projected = (window.reactFlowInstance && typeof window.reactFlowInstance.project === 'function')
        ? window.reactFlowInstance.project({ x: relX, y: relY })
        : { x: relX, y: relY };

      const targetX = Math.round(projected.x + offsetX);
      const targetY = Math.round(projected.y + offsetY);

      // Throttle logs
      const now = Date.now();
      if (now - lastMoveRef.current > 100) {
        console.debug && console.debug(`[RelacionNode][onMove handle] edge=${id} idx=${index} pos=`, { targetX, targetY });
        lastMoveRef.current = now;
      }

      setLocalPoints(prev => {
        const next = prev.map(p => ({ x: p.x, y: p.y }));
        next[index] = { x: targetX, y: targetY };
        return next;
      });
    };

    const onUp = () => {
      try { if (usingCapture) targetEl.releasePointerCapture && targetEl.releasePointerCapture(pointerId); } catch (err) { /* ignore */ }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);

      // terminar dragging
      setDraggingHandle(null);

      console.debug && console.debug(`[RelacionNode][onUp handle] edge=${id} idx=${index} finalPoints=`, localPointsRef.current);
      emitPointsChange(localPointsRef.current);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  // Handles intermedios (si hay más de 2 puntos)
  const intermediateHandles = (() => {
    const len = localPoints.length;
    if (len <= 2) return null;
    return localPoints.slice(1, -1).map((p, idx) => {
      const handleIndex = idx + 1;
      const rp = getRenderedPoint(p, handleIndex, len);

      const isActive = draggingHandle === handleIndex;
      const isHover = hoverHandle === handleIndex;
      const fill = isActive || isHover ? '#ffdede' : '#fff';
      const stroke = isActive || isHover ? '#cc0000' : '#0b8a3e';
      const cursor = isActive ? 'grabbing' : 'grab';
      return (
        <rect
          key={`handle-${handleIndex}`}
          x={rp.x - 6}
          y={rp.y - 6}
          width={12}
          height={12}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
          style={{ cursor, pointerEvents: 'all' }}
          onPointerDown={startHandlePointerDrag(handleIndex)}
          onPointerEnter={() => setHoverHandle(handleIndex)}
          onPointerLeave={() => setHoverHandle(null)}
        />
      );
    });
  })();

  // Render endpoints (rects) para permitir arrastrarlos y cambiar handle
  // first point index 0 -> source, last index len-1 -> target
  const len = localPoints.length;
  const sourceRendered = getRenderedPoint(localPoints[0], 0, len);
  const targetRendered = getRenderedPoint(localPoints[len - 1], len - 1, len);

  // Renderizar el SVG
  return (
    <>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'auto' }}>
        {/* zona de impacto amplia (usa los mismos puntos renderizados) */}
        <polyline points={pointsStr} fill="none" stroke="rgba(0,0,0,0.01)" strokeWidth={12} style={{ pointerEvents: 'stroke', cursor: 'context-menu' }} />
        {/* linea visible */}
        <polyline points={pointsStr} fill="none" stroke={data?.stroke || '#333'} strokeWidth={data?.strokeWidth || 2} strokeDasharray={data?.strokeDasharray} style={{ pointerEvents: 'none' }} />
        {/* handles (solo intermedios) */}
        <g style={{ pointerEvents: 'all' }}>
          {intermediateHandles}
        </g>

        {/* handles de endpoints */}
        <rect
          x={sourceRendered.x - 6}
          y={sourceRendered.y - 6}
          width={12}
          height={12}
          fill={draggingHandle === 0 || hoverHandle === 0 ? '#ffdede' : '#fff'}
          stroke={draggingHandle === 0 || hoverHandle === 0 ? '#cc0000' : '#0b8a3e'}
          strokeWidth={1.5}
          style={{ cursor: draggingHandle === 0 ? 'grabbing' : 'grab', pointerEvents: 'all' }}
          onPointerDown={startEndpointPointerDrag('source', 0)}
          onPointerEnter={() => setHoverHandle(0)}
          onPointerLeave={() => setHoverHandle(null)}
        />
        <rect
          x={targetRendered.x - 6}
          y={targetRendered.y - 6}
          width={12}
          height={12}
          fill={draggingHandle === len - 1 || hoverHandle === len - 1 ? '#ffdede' : '#fff'}
          stroke={draggingHandle === len - 1 || hoverHandle === len - 1 ? '#cc0000' : '#0b8a3e'}
          strokeWidth={1.5}
          style={{ cursor: draggingHandle === len - 1 ? 'grabbing' : 'grab', pointerEvents: 'all' }}
          onPointerDown={startEndpointPointerDrag('target', len - 1)}
          onPointerEnter={() => setHoverHandle(len - 1)}
          onPointerLeave={() => setHoverHandle(null)}
        />
      </svg>

      <EdgeLabelRenderer>
        {/* labels si aplican */}
      </EdgeLabelRenderer>
    </>
  );
};

export default RelacionNode;