import { useCallback, useState } from 'react';

export const useDragAndDrop = (id, localPointsRef, updatePoints) => {
  const [hoverHandle, setHoverHandle] = useState(null);
  const [draggingHandle, setDraggingHandle] = useState(null);

  const emitEndpointChange = useCallback((which, projectedPoint, clientX = null, clientY = null) => {
    try {
      const detail = { id, which, point: projectedPoint, clientX, clientY };
      window.dispatchEvent(new CustomEvent('edge-endpoint-change', { detail }));
    } catch (err) {
      console.warn('[RelacionNode] emitEndpointChange error', err);
    }
  }, [id]);

  const emitPointsChange = useCallback((points) => {
    window.dispatchEvent(new CustomEvent('edge-points-change', { detail: { id, points } }));
  }, [id]);

  const startEndpointPointerDrag = useCallback((which, index) => (e) => {
    e.stopPropagation?.();
    e.preventDefault?.();

    const startClientX = e.clientX || 0;
    const startClientY = e.clientY || 0;
    let moved = false;
    const startTime = Date.now();

    const onMove = (ev) => {
      moved = true;
      const projected = { x: ev.clientX, y: ev.clientY };
      window.dispatchEvent(new CustomEvent('edge-drag-move', {
        detail: { id, which, index, point: projected, clientX: ev.clientX, clientY: ev.clientY }
      }));
    };

    const onUp = (ev) => {
      const finalClientX = ev.clientX || startClientX;
      const finalClientY = ev.clientY || startClientY;
      const dt = Date.now() - startTime;

      if (!moved && dt < 300) {
        window.dispatchEvent(new CustomEvent('edge-select-for-handle-assign', { detail: { id, which } }));
      } else {
        emitEndpointChange(which, { x: finalClientX, y: finalClientY }, finalClientX, finalClientY);
      }

      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [id, emitEndpointChange]);

  const startHandlePointerDrag = useCallback((index) => (e) => {
    e.preventDefault?.();
    e.stopPropagation?.();
    setDraggingHandle(index);

    const rect = (window.getReactFlowWrapperRect && window.getReactFlowWrapperRect()) || { left: 0, top: 0 };
    const startClientX = e.clientX || 0;
    const startClientY = e.clientY || 0;
    const relStartX = startClientX - rect.left;
    const relStartY = startClientY - rect.top;

    const projectedStart = window.reactFlowInstance?.project?.({ x: relStartX, y: relStartY }) || { x: relStartX, y: relStartY };
    const currentPoint = localPointsRef.current[index] || projectedStart;
    const offsetX = currentPoint.x - projectedStart.x;
    const offsetY = currentPoint.y - projectedStart.y;

    const onMove = (evt) => {
      const clientX = evt.clientX || 0;
      const clientY = evt.clientY || 0;
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const projected = window.reactFlowInstance?.project?.({ x: relX, y: relY }) || { x: relX, y: relY };
      const targetX = Math.round(projected.x + offsetX);
      const targetY = Math.round(projected.y + offsetY);

      updatePoints(prev => {
        const next = [...prev];
        next[index] = { x: targetX, y: targetY };
        return next;
      });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setDraggingHandle(null);
      emitPointsChange(localPointsRef.current);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [localPointsRef, updatePoints, emitPointsChange]);

  return {
    hoverHandle,
    draggingHandle,
    setHoverHandle,
    setDraggingHandle,
    startEndpointPointerDrag,
    startHandlePointerDrag
  };
};