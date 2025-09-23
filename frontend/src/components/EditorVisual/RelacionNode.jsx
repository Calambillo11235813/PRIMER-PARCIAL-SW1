import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer } from '@xyflow/react';

/**
 * Edge custom para UML con diferentes tipos de relaciones:
 * - asociacion: Línea continua simple
 * - composicion: Línea continua con rombo relleno en el origen
 * - agregacion: Línea continua con rombo vacío en el origen  
 * - herencia: Línea continua con triángulo vacío en el destino
 * - realizacion: Línea punteada con triángulo vacío en el destino
 * - dependencia: Línea punteada con flecha en el destino
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID único de la relación
 * @param {number} props.sourceX - Coordenada X del punto origen
 * @param {number} props.sourceY - Coordenada Y del punto origen
 * @param {number} props.targetX - Coordenada X del punto destino
 * @param {number} props.targetY - Coordenada Y del punto destino
 * @param {Object} props.data - Datos de la relación (tipo, multiplicidades, callbacks)
 * @param {string} props.data.tipo - Tipo de relación UML
 * @param {string} props.data.multiplicidadSource - Multiplicidad del lado origen
 * @param {string} props.data.multiplicidadTarget - Multiplicidad del lado destino
 * @param {Object} props.data.multiplicidadSourcePos - Posición personalizada de la multiplicidad origen
 * @param {Object} props.data.multiplicidadTargetPos - Posición personalizada de la multiplicidad destino
 * @param {Function} props.data.onMultiplicityPositionChange - Callback para cambios de posición de multiplicidades
 */
const RelacionNode = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data = {},
}) => {
  const draggingRef = useRef(null);

  // Estilos constantes para cada tipo de relación (fuera del render para evitar recreación)
  const ESTILOS_RELACION = useMemo(() => ({
    asociacion: {
      stroke: '#374151',
      strokeWidth: 2,
      strokeDasharray: 'none',
      startMarker: null,
      endMarker: null,
    },
    composicion: {
      stroke: '#DC2626',
      strokeWidth: 3,
      strokeDasharray: 'none',
      startMarker: 'diamond',
      startMarkerFill: true,
      endMarker: null,
    },
    agregacion: {
      stroke: '#2563EB',
      strokeWidth: 2,
      strokeDasharray: 'none',
      startMarker: 'diamond',
      startMarkerFill: false,
      endMarker: null,
    },
    herencia: {
      stroke: '#059669',
      strokeWidth: 2,
      strokeDasharray: 'none',
      startMarker: null,
      endMarker: 'triangle',
      endMarkerFill: false,
    },
    realizacion: {
      stroke: '#7C3AED',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      startMarker: null,
      endMarker: 'triangle',
      endMarkerFill: false,
    },
    dependencia: {
      stroke: '#D97706',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      startMarker: null,
      endMarker: 'arrow',
    }
  }), []);

  // Obtener estilo actual basado en el tipo de relación
  const estilo = ESTILOS_RELACION[data?.tipo] || ESTILOS_RELACION.asociacion;

  // Calcular path SVG para la línea
  const path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;

  // --- Funciones para renderizar marcadores ---

  // helper para rotar un punto (rx,ry) alrededor del origen por angle (radianes)
  const rotatePoint = (rx, ry, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: rx * cos - ry * sin, y: rx * sin + ry * cos };
  };

  // Renderizar rombo centrado en (cx,cy) rotado por angle (radianes)
  const renderDiamondMarker = useCallback((cx, cy, angle, filled) => {
    const size = 22; // <-- AUMENTA este valor para hacer el rombo más grande (ej. 18..28)
    const half = size / 2;

    // puntos relativos (derecha, arriba, izquierda, abajo) -> rombo simétrico
    const rel = [
      [half, 0],
      [0, -half],
      [-half, 0],
      [0, half],
    ];

    const points = rel
      .map(([rx, ry]) => {
        const r = rotatePoint(rx, ry, angle);
        return `${cx + r.x},${cy + r.y}`;
      })
      .join(' ');

    return (
      <polygon
        points={points}
        fill={filled ? estilo.stroke : 'white'}
        stroke={estilo.stroke}
        strokeWidth={2}
        style={{ pointerEvents: 'none' }}
      />
    );
  }, [estilo.stroke]);

  // Renderizar triángulo orientado por angle (radianes)
  const renderTriangleMarker = useCallback((cx, cy, angle, filled) => {
    const size = 20; // ↑ tamaño mayor para herencia/realizacion
    // triángulo apuntando hacia la derecha en coordenadas locales: punta y dos vértices traseros
    const rel = [
      [size / 2, 0], // punta
      [-size / 2, -size / 2],
      [-size / 2, size / 2],
    ];

    const points = rel
      .map(([rx, ry]) => {
        const r = rotatePoint(rx, ry, angle);
        return `${cx + r.x},${cy + r.y}`;
      })
      .join(' ');

    return (
      <polygon
        points={points}
        fill={filled ? estilo.stroke : 'white'}
        stroke={estilo.stroke}
        strokeWidth={2.2}
        style={{ pointerEvents: 'none' }}
      />
    );
  }, [estilo.stroke]);

  // Renderizar flecha simple orientada por angle
  const renderArrowMarker = useCallback((cx, cy, angle) => {
    const size = 20; // ↑ tamaño mayor para dependencia/arrow
    const rel = [
      [0, 0],
      [-size * 1.4, -size],
      [-size * 1.4, size],
    ];
    const points = rel
      .map(([rx, ry]) => {
        const r = rotatePoint(rx, ry, angle);
        return `${cx + r.x},${cy + r.y}`;
      })
      .join(' ');
    return (
      <polygon
        points={points}
        fill={estilo.stroke}
        stroke={estilo.stroke}
        strokeWidth={1.6}
        style={{ pointerEvents: 'none' }}
      />
    );
  }, [estilo.stroke]);

  // renderMarkers: calcular centro del marcador usando vector unitario y rotación
  const renderMarkers = useCallback(() => {
    const markers = [];

    // Distancias más cortas para rombos (pegados a la clase)
    const diamondDistance = 12; // <-- AUMENTA si el rombo grande queda solapado, ajusta hasta que parezca pegado
    const defaultDistance = 15;

    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const dist = Math.max(Math.hypot(dx, dy), 1);
    const ux = dx / dist;
    const uy = dy / dist;
    const angle = Math.atan2(dy, dx); // dirección de la línea (radianes)

    const startMarkerDistance = estilo.startMarker === 'diamond' ? diamondDistance : defaultDistance;
    const endMarkerDistance = estilo.endMarker === 'diamond' ? diamondDistance : defaultDistance;

    // start marker (origen)
    if (estilo.startMarker) {
      const cx = sourceX + ux * startMarkerDistance;
      const cy = sourceY + uy * startMarkerDistance;
      if (estilo.startMarker === 'diamond') {
        markers.push(renderDiamondMarker(cx, cy, angle, estilo.startMarkerFill));
      }
      // otros tipos de startMarker si fueran necesarios
    }

    // end marker (destino)
    if (estilo.endMarker) {
      const cx = targetX - ux * endMarkerDistance;
      const cy = targetY - uy * endMarkerDistance;
      if (estilo.endMarker === 'triangle') {
        markers.push(renderTriangleMarker(cx, cy, angle, estilo.endMarkerFill));
      } else if (estilo.endMarker === 'arrow') {
        markers.push(renderArrowMarker(cx, cy, angle));
      }
    }

    return <g style={{ pointerEvents: 'none' }}>{markers}</g>;
  }, [
    estilo.startMarker, estilo.startMarkerFill, estilo.endMarker, estilo.endMarkerFill,
    sourceX, sourceY, targetX, targetY, renderDiamondMarker, renderTriangleMarker, renderArrowMarker, estilo
  ]);

  // --- Lógica para etiquetas de multiplicidad movibles ---
  const [srcLabelPos, setSrcLabelPos] = useState(null);
  const [tgtLabelPos, setTgtLabelPos] = useState(null);

  /**
   * Calcula la posición por defecto para las etiquetas de multiplicidad
   * @returns {Object} Objeto con posiciones source y target
   */
  const calcularPosicionesDefault = useCallback(() => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const dist = Math.max(Math.hypot(dx, dy), 1);
    const ux = dx / dist;
    const uy = dy / dist;

    // Calcular vector perpendicular CONSISTENTE (siempre hacia el mismo lado relativo)
    // Usar un cálculo que garantice consistencia independientemente de la dirección
    const px = -uy;
    const py = ux;

    // Ajustar offset para mejor posicionamiento
    const offsetAlong = 15; // Distancia desde el extremo a lo largo de la línea
    const perpOffset = -15; // Distancia perpendicular (negativo = hacia arriba/izquierda dependiendo de la dirección)

    // Para líneas muy cortas, reducir el offset para evitar superposición
    const adjustedOffsetAlong = dist < 50 ? offsetAlong * 0.5 : offsetAlong;

    return {
      source: {
        x: sourceX + ux * adjustedOffsetAlong + px * perpOffset,
        y: sourceY + uy * adjustedOffsetAlong + py * perpOffset,
      },
      target: {
        x: targetX - ux * adjustedOffsetAlong + px * perpOffset,
        y: targetY - uy * adjustedOffsetAlong + py * perpOffset,
      }
    };
  }, [sourceX, sourceY, targetX, targetY]);


  /**
   * Función alternativa más robusta para cálculo de posición
   */
  const calcularPosicionInteligente = useCallback((esOrigen) => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    // Si la línea es muy corta, usar posiciones fijas
    if (Math.hypot(dx, dy) < 30) {
      return esOrigen
        ? { x: sourceX - 20, y: sourceY - 15 }
        : { x: targetX + 20, y: targetY - 15 };
    }

    const angle = Math.atan2(dy, dx);
    const perpendicularAngle = angle + Math.PI / 2; // 90 grados perpendicular

    // Distancias ajustables
    const distanceFromEnd = 25;
    const distanceFromLine = 15;

    if (esOrigen) {
      return {
        x: sourceX + Math.cos(angle) * distanceFromEnd + Math.cos(perpendicularAngle) * distanceFromLine,
        y: sourceY + Math.sin(angle) * distanceFromEnd + Math.sin(perpendicularAngle) * distanceFromLine
      };
    } else {
      return {
        x: targetX - Math.cos(angle) * distanceFromEnd + Math.cos(perpendicularAngle) * distanceFromLine,
        y: targetY - Math.sin(angle) * distanceFromEnd + Math.sin(perpendicularAngle) * distanceFromLine
      };
    }
  }, [sourceX, sourceY, targetX, targetY]);






  // Efecto para inicializar posiciones de las etiquetas - MEJORADO
  useEffect(() => {
    // Usar el cálculo inteligente para mejor ajuste
    const posicionesSource = data?.multiplicidadSourcePos || calcularPosicionInteligente(true);
    const posicionesTarget = data?.multiplicidadTargetPos || calcularPosicionInteligente(false);

    setSrcLabelPos(posicionesSource);
    setTgtLabelPos(posicionesTarget);
  }, [
    data?.multiplicidadSourcePos,
    data?.multiplicidadTargetPos,
    calcularPosicionInteligente,
    sourceX, sourceY, targetX, targetY // Añadir dependencias para recalcular cuando se mueva la línea
  ]);


  // Función para forzar recálculo cuando cambie la geometría de la línea
  useEffect(() => {
    // Recalcular posiciones cuando cambien las coordenadas de los extremos
    if (srcLabelPos && tgtLabelPos) {
      const nuevasPosicionesSource = calcularPosicionInteligente(true);
      const nuevasPosicionesTarget = calcularPosicionInteligente(false);

      // Solo actualizar si hay cambios significativos (evitar bucles)
      const distanciaSource = Math.hypot(
        nuevasPosicionesSource.x - srcLabelPos.x,
        nuevasPosicionesSource.y - srcLabelPos.y
      );
      const distanciaTarget = Math.hypot(
        nuevasPosicionesTarget.x - tgtLabelPos.x,
        nuevasPosicionesTarget.y - tgtLabelPos.y
      );

      if (distanciaSource > 5) {
        setSrcLabelPos(nuevasPosicionesSource);
      }
      if (distanciaTarget > 5) {
        setTgtLabelPos(nuevasPosicionesTarget);
      }
    }
  }, [sourceX, sourceY, targetX, targetY, calcularPosicionInteligente, srcLabelPos, tgtLabelPos]);

  
  /**
   * Maneja el inicio del arrastre de una etiqueta de multiplicidad
   * @param {Event} e - Evento del mouse
   * @param {string} side - Lado de la relación ('source' o 'target')
   */
  const startDrag = useCallback((e, side) => {
    // Verificar que es click izquierdo y no hay arrastre en curso
    if (e.button !== 0 || draggingRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const currentPos = side === 'source' ? srcLabelPos : tgtLabelPos;
    if (!currentPos) return;

    draggingRef.current = {
      side,
      startX: e.clientX,
      startY: e.clientY,
      origPos: { ...currentPos },
    };

    const handleMove = (ev) => {
      if (!draggingRef.current) return;

      const dX = ev.clientX - draggingRef.current.startX;
      const dY = ev.clientY - draggingRef.current.startY;

      const newPos = {
        x: draggingRef.current.origPos.x + dX,
        y: draggingRef.current.origPos.y + dY,
      };

      if (draggingRef.current.side === 'source') {
        setSrcLabelPos(newPos);
      } else {
        setTgtLabelPos(newPos);
      }
    };

    const handleUp = () => {
      if (!draggingRef.current) return;

      const { side } = draggingRef.current;
      const finalPos = side === 'source' ? srcLabelPos : tgtLabelPos;

      // Notificar cambio de posición si existe el callback
      if (typeof data?.onMultiplicityPositionChange === 'function' && finalPos) {
        try {
          data.onMultiplicityPositionChange(id, side, finalPos);
        } catch (err) {
          console.warn('Error al guardar posición de multiplicidad:', err);
        }
      }

      draggingRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [id, srcLabelPos, tgtLabelPos, data]);

  // Renderizar etiquetas de multiplicidad
  const renderMultiplicityLabels = useCallback(() => {
    // Mostrar multiplicidades solamente para el tipo 'asociacion'
    const tiposQueMuestranMultiplicidad = new Set(['asociacion']);
    if (!tiposQueMuestranMultiplicidad.has(data?.tipo)) return null;
 
    return (
      <>
        {data?.multiplicidadSource && srcLabelPos && (
          <div
            onMouseDown={(e) => startDrag(e, 'source')}
            style={{
              position: 'absolute',
              left: `${srcLabelPos.x}px`,
              top: `${srcLabelPos.y}px`,
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              padding: '0 2px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              color: estilo.stroke,
              cursor: 'grab',
              pointerEvents: 'auto',
              userSelect: 'none',
              zIndex: 10,
            }}
            title="Arrastrar para mover"
          >
            {data.multiplicidadSource}
          </div>
        )}
 
        {data?.multiplicidadTarget && tgtLabelPos && (
          <div
            onMouseDown={(e) => startDrag(e, 'target')}
            style={{
              position: 'absolute',
              left: `${tgtLabelPos.x}px`,
              top: `${tgtLabelPos.y}px`,
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              padding: '0 2px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              color: estilo.stroke,
              cursor: 'grab',
              pointerEvents: 'auto',
              userSelect: 'none',
              zIndex: 10,
            }}
            title="Arrastrar para mover"
          >
            {data.multiplicidadTarget}
          </div>
        )}
      </>
    );
  }, [data, srcLabelPos, tgtLabelPos, estilo.stroke, startDrag]);

  return (
    <>
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'auto',
        }}
      >
        {/* Zona de impacto ampliada para mejor selección */}
        <path
          d={path}
          fill="none"
          stroke="rgba(0,0,0,0.01)"
          strokeWidth={Math.max(estilo.strokeWidth * 6, 12)}
          style={{
            pointerEvents: 'stroke',
            cursor: 'context-menu',
          }}
        />

        {/* Línea visible de la relación */}
        <path
          d={path}
          fill="none"
          stroke={estilo.stroke}
          strokeWidth={estilo.strokeWidth}
          strokeDasharray={estilo.strokeDasharray}
          style={{ pointerEvents: 'none' }}
        />

        {/* Marcadores de la relación */}
        {renderMarkers()}
      </svg>

      {/* Etiquetas de multiplicidad movibles */}
      <EdgeLabelRenderer>
        {renderMultiplicityLabels()}
      </EdgeLabelRenderer>
    </>
  );
};

export default RelacionNode;