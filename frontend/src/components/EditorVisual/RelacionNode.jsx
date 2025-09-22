import React from 'react';
import { BaseEdge, EdgeLabelRenderer } from '@xyflow/react';

/**
 * Edge custom para UML con diferentes tipos de relaciones:
 * - asociacion: Línea continua simple
 * - composicion: Línea continua con rombo relleno en el origen
 * - agregacion: Línea continua con rombo vacío en el origen  
 * - herencia: Línea continua con triángulo vacío en el destino
 * - dependencia: Línea punteada
 */
const RelacionNode = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
}) => {
  const path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  // Configuración de estilos por tipo de relación
  const getRelacionStyle = (tipo) => {
    const styles = {
      asociacion: {
        stroke: '#374151',
        strokeWidth: 2,
        strokeDasharray: 'none',
        startMarker: null,
        endMarker: null,
      },
      composicion: {
        stroke: '#DC2626',
        strokeWidth: 2,
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
    };
    return styles[tipo] || styles.asociacion;
  };

  const estilo = getRelacionStyle(data?.tipo || 'asociacion');

  // Dibujar marcadores personalizados
  const renderMarkers = () => {
    const markers = [];
    const markerSize = 8;

    // Marcador de inicio (origen)
    if (estilo.startMarker) {
      const startAngle = Math.atan2(targetY - sourceY, targetX - sourceX);
      const startDX = Math.cos(startAngle) * 15;
      const startDY = Math.sin(startAngle) * 15;

      if (estilo.startMarker === 'diamond') {
        // Rombo para composición/agregación
        const points = [
          { x: sourceX + startDX, y: sourceY + startDY },
          { x: sourceX + startDX - markerSize, y: sourceY + startDY },
          { x: sourceX + startDX - markerSize * 2, y: sourceY + startDY },
          { x: sourceX + startDX - markerSize, y: sourceY + startDY - markerSize }
        ].map(p => `${p.x},${p.y}`).join(' ');

        markers.push(
          <polygon
            key="start-marker"
            points={points}
            fill={estilo.startMarkerFill ? estilo.stroke : 'white'}
            stroke={estilo.stroke}
            strokeWidth={1.5}
          />
        );
      }
    }

    // Marcador de fin (destino)
    if (estilo.endMarker) {
      const endAngle = Math.atan2(sourceY - targetY, sourceX - targetX);
      const endDX = Math.cos(endAngle) * 15;
      const endDY = Math.sin(endAngle) * 15;

      if (estilo.endMarker === 'triangle') {
        // Triángulo para herencia/realización
        const points = [
          { x: targetX + endDX, y: targetY + endDY },
          { x: targetX + endDX - markerSize, y: targetY + endDY - markerSize },
          { x: targetX + endDX - markerSize, y: targetY + endDY + markerSize }
        ].map(p => `${p.x},${p.y}`).join(' ');

        markers.push(
          <polygon
            key="end-marker"
            points={points}
            fill={estilo.endMarkerFill ? estilo.stroke : 'white'}
            stroke={estilo.stroke}
            strokeWidth={1.5}
          />
        );
      } else if (estilo.endMarker === 'arrow') {
        // Flecha simple para dependencia
        const points = [
          { x: targetX + endDX, y: targetY + endDY },
          { x: targetX + endDX - markerSize * 1.5, y: targetY + endDY - markerSize },
          { x: targetX + endDX - markerSize * 1.5, y: targetY + endDY + markerSize }
        ].map(p => `${p.x},${p.y}`).join(' ');

        markers.push(
          <polygon
            key="end-marker"
            points={points}
            fill={estilo.stroke}
            stroke={estilo.stroke}
            strokeWidth={1}
          />
        );
      }
    }

    return markers;
  };

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
          // HABILITAR eventos pointer para que ReactFlow reciba contextmenu en la arista
          pointerEvents: 'auto',
        }}
      >
        {/* Línea principal */}
        <path
          d={path}
          fill="none"
          stroke={estilo.stroke}
          strokeWidth={estilo.strokeWidth}
          strokeDasharray={estilo.strokeDasharray}
          // Asegura que solo el trazo capture eventos (clic derecho sobre la línea)
          style={{ pointerEvents: 'stroke' }}
        />
        
        {/* Marcadores */}
        {renderMarkers()}
      </svg>
      
      {/* Etiquetas de multiplicidad */}
      <EdgeLabelRenderer>
        {data?.multiplicidadSource && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + (targetX - sourceX) * 0.25}px, ${sourceY + (targetY - sourceY) * 0.25}px)`,
              background: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 'bold',
              border: `1px solid ${estilo.stroke}`,
              color: estilo.stroke,
              // Evitar que la etiqueta interfiera con el click derecho sobre la línea
              pointerEvents: 'none',
            }}
          >
            {data.multiplicidadSource}
          </div>
        )}

        {data?.multiplicidadTarget && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX - (targetX - sourceX) * 0.25}px, ${targetY - (targetY - sourceY) * 0.25}px)`,
              background: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 'bold',
              border: `1px solid ${estilo.stroke}`,
              color: estilo.stroke,
              pointerEvents: 'none',
            }}
          >
            {data.multiplicidadTarget}
          </div>
        )}

        {/* Etiqueta del tipo de relación */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px)`,
            background: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            border: `1px solid ${estilo.stroke}`,
            color: estilo.stroke,
            textTransform: 'capitalize',
            pointerEvents: 'none',
          }}
        >
          {data.tipo || 'asociacion'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default RelacionNode;