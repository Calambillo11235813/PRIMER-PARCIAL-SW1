import React, { useCallback, useMemo } from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';

// Hooks
import { usePointsManagement } from './hooks/usePointsManagement';
import { useEdgeDrag } from './hooks/useEdgeDrag';
import { getHandlePosition } from './utils_1/getHandlePosition';

// Components
import { RelationshipLine } from './components/RelationshipLine';
import { MultiplicidadLabels } from './components/MultiplicidadLabels';
import { ConnectionHandles } from './components/ConnectionHandles';
import { UMLSymbols } from './components/UMLSymbols';
import { TIPOS_RELACION } from './constants/umlTypes';
import { LineaClaseAsociacion } from './components/UMLSymbols/LineaClaseAsociacion';
import { FlechaRecursiva } from './components/UMLSymbols/FlechaRecursiva';

const RelacionNode = ({ id, sourceX, sourceY, targetX, targetY, sourceHandle, targetHandle, data }) => {
  const tipoRelacion = data?.tipo || TIPOS_RELACION.ASOCIACION;

  // Obtén la posición REAL del handle
  const handleSourcePos = getHandlePosition(sourceHandle, sourceX, sourceY);
  const handleTargetPos = getHandlePosition(targetHandle, targetX, targetY);

  const initialPoints = data?.points || null;

  // Gestión de puntos - USA LAS POSICIONES DE HANDLES
  const { localPoints, localPointsRef, updatePoints } = usePointsManagement(
    initialPoints, 
    data?.layout, 
    handleSourcePos.x, 
    handleSourcePos.y, 
    handleTargetPos.x, 
    handleTargetPos.y
  );

  // Drag and drop
  const dragEdge = useEdgeDrag(id, localPointsRef, updatePoints);

  // Helper para obtener puntos renderizados - ACTUALIZADO
  const getRenderedPoint = useCallback((p, i, len) => {
    if (i === 0) return { 
      x: Math.round(handleSourcePos.x), 
      y: Math.round(handleSourcePos.y) 
    };
    if (i === len - 1) return { 
      x: Math.round(handleTargetPos.x), 
      y: Math.round(handleTargetPos.y) 
    };
    return p;
  }, [handleSourcePos, handleTargetPos]);

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
        {tipoRelacion === TIPOS_RELACION.ASSOCIATION_CLASS ? (
          <LineaClaseAsociacion
            x1={handleSourcePos.x}
            y1={handleSourcePos.y}
            x2={handleTargetPos.x}
            y2={handleTargetPos.y}
          />
        ) : tipoRelacion === TIPOS_RELACION.RECURSIVA ? (
          // Para recursiva: usa la posición del handle y determina dirección
          <FlechaRecursiva 
            x={handleSourcePos.x} 
            y={handleSourcePos.y} 
            size={100}
            handleId={sourceHandle} // Pasa el ID para determinar dirección
          />
        ) : (
          // Para otros tipos: línea normal + símbolos
          <>
            <RelationshipLine pointsStr={pointsStr} tipoRelacion={tipoRelacion} />
            <UMLSymbols
              localPoints={localPoints}
              getRenderedPoint={getRenderedPoint}
              tipoRelacion={tipoRelacion}
            />
          </>
        )}

        {/* Resto del código igual... */}
      </svg>
    </>
  );
};

export default React.memo(RelacionNode);