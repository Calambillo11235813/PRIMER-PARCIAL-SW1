import React, { useCallback, useMemo } from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';

// Hooks
import { usePointsManagement } from './hooks/usePointsManagement';
import { useEdgeDrag } from './hooks/useEdgeDrag';

// Components
import { RelationshipLine } from './components/RelationshipLine';
import { MultiplicidadLabels } from './components/MultiplicidadLabels';
import { ConnectionHandles } from './components/ConnectionHandles';
import { UMLSymbols } from './components/UMLSymbols';

// Constants
import { TIPOS_RELACION } from './constants/umlTypes';

const RelacionNode = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
  const layout = data?.layout || null;
  const tipoRelacion = data?.tipo || TIPOS_RELACION.ASOCIACION;
  const initialPoints = data?.points || null;

  // Gestión de puntos
  const { localPoints, localPointsRef, updatePoints } = usePointsManagement(
    initialPoints, layout, sourceX, sourceY, targetX, targetY
  );

  // Drag and drop
  const dragEdge = useEdgeDrag(id, localPointsRef, updatePoints);

  const manejarInicioArrastreEndpoint = dragEdge.manejarInicioArrastreEndpoint;
  const manejarInicioArrastreHandle = dragEdge.manejarInicioArrastreHandle;

  // Helper para obtener puntos renderizados
  const getRenderedPoint = useCallback((p, i, len) => {
    if (i === 0) return { x: Math.round(sourceX), y: Math.round(sourceY) };
    if (i === len - 1) return { x: Math.round(targetX), y: Math.round(targetY) };
    return p;
  }, [sourceX, sourceY, targetX, targetY]);

  // String de puntos para SVG
  const pointsStr = useMemo(() => {
    const len = localPoints.length;
    if (len === 0) return '';
    return localPoints.map((p, i) => {
      const rp = getRenderedPoint(p, i, len);
      return `${Math.round(rp.x)},${Math.round(rp.y)}`;
    }).join(' ');
  }, [localPoints, getRenderedPoint]);

  if (localPoints.length === 0) return null;

  return (
    <>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'auto' }}>
        <RelationshipLine pointsStr={pointsStr} tipoRelacion={tipoRelacion} />

        <UMLSymbols
          localPoints={localPoints}
          getRenderedPoint={getRenderedPoint}
          tipoRelacion={tipoRelacion}
        />

        <MultiplicidadLabels
          localPoints={localPoints}
          getRenderedPoint={getRenderedPoint}
          data={data}
        />

        <ConnectionHandles
          localPoints={localPoints}
          getRenderedPoint={getRenderedPoint}
          draggingHandle={dragEdge.draggingHandle}
          hoverHandle={dragEdge.hoverHandle}
          startEndpointPointerDrag={dragEdge.manejarInicioArrastreEndpoint}
          startHandlePointerDrag={dragEdge.manejarInicioArrastreHandle}
          setHoverHandle={dragEdge.setHoverHandle}
        />
      </svg>

      <EdgeLabelRenderer>
        {/* Labels adicionales si es necesario */}
      </EdgeLabelRenderer>
    </>
  );
};

export default React.memo(RelacionNode);