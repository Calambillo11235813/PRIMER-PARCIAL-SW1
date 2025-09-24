import React from 'react';

export const ConnectionHandles = ({ 
  localPoints, 
  getRenderedPoint, 
  draggingHandle, 
  hoverHandle, 
  startEndpointPointerDrag, 
  startHandlePointerDrag, 
  setHoverHandle 
}) => {
  const len = localPoints.length;
  if (len === 0) return null;

  const sourceRendered = getRenderedPoint(localPoints[0], 0, len);
  const targetRendered = getRenderedPoint(localPoints[len - 1], len - 1, len);

  const intermediateHandles = localPoints.slice(1, -1).map((p, idx) => {
    const handleIndex = idx + 1;
    const rp = getRenderedPoint(p, handleIndex, len);
    const isActive = draggingHandle === handleIndex;
    const isHover = hoverHandle === handleIndex;

    return (
      <rect key={`handle-${handleIndex}`} x={rp.x - 6} y={rp.y - 6} width={12} height={12}
        fill={isActive || isHover ? '#ffdede' : '#fff'}
        stroke={isActive || isHover ? '#cc0000' : '#0b8a3e'} strokeWidth={1.5}
        style={{ cursor: isActive ? 'grabbing' : 'grab', pointerEvents: 'all' }}
        onPointerDown={startHandlePointerDrag(handleIndex)}
        onPointerEnter={() => setHoverHandle(handleIndex)}
        onPointerLeave={() => setHoverHandle(null)} />
    );
  });

  return (
    <g style={{ pointerEvents: 'all' }}>
      {intermediateHandles}
      <EndpointHandle point={sourceRendered} index={0} type="source" 
        draggingHandle={draggingHandle} hoverHandle={hoverHandle}
        onPointerDown={startEndpointPointerDrag} setHoverHandle={setHoverHandle} />
      <EndpointHandle point={targetRendered} index={len - 1} type="target" 
        draggingHandle={draggingHandle} hoverHandle={hoverHandle}
        onPointerDown={startEndpointPointerDrag} setHoverHandle={setHoverHandle} />
    </g>
  );
};

const EndpointHandle = ({ point, index, type, draggingHandle, hoverHandle, onPointerDown, setHoverHandle }) => {
  const isActive = draggingHandle === index;
  const isHover = hoverHandle === index;

  return (
    <rect x={point.x - 8} y={point.y - 8} width={16} height={16}
      fill={isActive || isHover ? '#ffdede' : 'rgba(255,255,255,0.7)'}
      stroke={isActive || isHover ? '#cc0000' : '#0b8a3e'} strokeWidth={2}
      style={{ cursor: isActive ? 'grabbing' : 'grab' }}
      onPointerDown={onPointerDown(type, index)}
      onPointerEnter={() => setHoverHandle(index)}
      onPointerLeave={() => setHoverHandle(null)} />
  );
};