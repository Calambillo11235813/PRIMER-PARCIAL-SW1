import React, { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * Componente para grupo de handles - Evita repetición de código
 */
const HandleGroup = ({ position, idBase, offsets }) => {
  const isVertical = position === Position.Left || position === Position.Right;
  const styleProperty = isVertical ? 'top' : 'left';
  
  const handleStyle = {
    width: 10, 
    height: 10, 
    background: '#22c55e', 
    border: '2px solid #fff', 
    borderRadius: '50%'
  };

  return (
    <>
      {offsets.map(offset => (
        <React.Fragment key={offset}>
          <Handle
            type="source"
            id={`${idBase}-src-${offset}`}
            position={position}
            style={{ [styleProperty]: `${offset}%`, ...handleStyle }}
            onClick={() => { 
              if (window.assignSelectedEdge) window.assignSelectedEdge(`${idBase}-src-${offset}`, idBase.split('-')[0]);
            }}
          />
          <Handle
            type="target"
            id={`${idBase}-tgt-${offset}`}
            position={position}
            style={{ [styleProperty]: `${offset}%`, ...handleStyle }}
            onClick={() => { 
              if (window.assignSelectedEdge) window.assignSelectedEdge(`${idBase}-tgt-${offset}`, idBase.split('-')[0]);
            }}
          />
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Tipos de datos (simulados para JavaScript, en TypeScript sería más robusto)
 */
const VisibilidadTypes = {
  PUBLIC: 'public',
  PRIVATE: 'private', 
  PROTECTED: 'protected',
  PACKAGE: 'package'
};

/**
 * Nodo de clase estilo Enterprise Architect UML 2.5 (3 compartimentos).
 * data: { nombre, estereotipo, atributos: [{vis, nombre, tipo, mult}], metodos: [{vis, nombre, firma}], color? }
 */
const ClaseNodeRF = ({ id, data, selected, onEdgeDragStart }) => {
  const nombre = data?.nombre || 'Clase';
  const estereotipo = data?.estereotipo;
  const atributos = data?.atributos || [];
  const metodos = data?.metodos || [];
  const esAbstracta = data?.esAbstracta || false;

  // Función para obtener el símbolo de visibilidad UML (memoizada)
  const obtenerSimboloVisibilidad = useCallback((vis) => {
    switch (vis) {
      case VisibilidadTypes.PUBLIC: return '+';
      case VisibilidadTypes.PRIVATE: return '-';
      case VisibilidadTypes.PROTECTED: return '#';
      case VisibilidadTypes.PACKAGE: return '~';
      default: return vis || '+';
    }
  }, []);

  // Manejo mejorado de eventos de drag
  const handleMouseDown = useCallback((e) => {
    if (e.target.id === `arrow-${id}`) return;
    e.stopPropagation();

    // Usar callback prop si está disponible, sino fallback a window global
    if (onEdgeDragStart) {
      onEdgeDragStart(id, e);
    } else if (window.startEdgeDrag) {
      window.startEdgeDrag(id, e);
    }
  }, [id, onEdgeDragStart]);

  const handleArrowMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();

    if (onEdgeDragStart) {
      onEdgeDragStart(id, e);
    } else if (window.startEdgeDrag) {
      window.startEdgeDrag(id, e);
    }
  }, [id, onEdgeDragStart]);

  // Renderizar atributo con formato UML estándar (memoizada)
  const renderAtributo = useCallback((a, i) => {
    if (typeof a === 'string') {
      return (
        <div key={i} className="flex items-start py-0.5">
          <span className="text-gray-500 font-mono text-xs mr-1">-</span>
          <span className="text-gray-800 text-xs">{a}</span>
        </div>
      );
    }

    return (
      <div key={i} className="flex items-start py-0.5">
        <span className="text-gray-500 font-mono text-xs mr-1 w-3 flex-shrink-0">
          {obtenerSimboloVisibilidad(a.vis)}
        </span>
        <span className="text-gray-800 text-xs">
          {a.nombre}
          {a.tipo && <span className="text-gray-500">: {a.tipo}</span>}
          {a.mult && <span className="text-blue-600"> [{a.mult}]</span>}
        </span>
      </div>
    );
  }, [obtenerSimboloVisibilidad]);

  // Renderizar método con formato UML estándar (memoizada)
  const renderMetodo = useCallback((m, i) => {
    if (typeof m === 'string') {
      return (
        <div key={i} className="flex items-start py-0.5">
          <span className="text-gray-500 font-mono text-xs mr-1">+</span>
          <span className="text-gray-800 text-xs">{m}()</span>
        </div>
      );
    }

    return (
      <div key={i} className="flex items-start py-0.5">
        <span className="text-gray-500 font-mono text-xs mr-1 w-3 flex-shrink-0">
          {obtenerSimboloVisibilidad(m.vis)}
        </span>
        <span className="text-gray-800 text-xs">
          {m.nombre}({m.params || ''})
          {m.tipo && <span className="text-gray-500">: {m.tipo}</span>}
        </span>
      </div>
    );
  }, [obtenerSimboloVisibilidad]);

  // Configuración de handles
  const handleOffsets = [15, 35, 65, 85];

  return (
    <div
      id={id}
      data-id={id}
      className={`
        bg-white border border-gray-300 rounded-sm shadow-sm
        font-['Segoe_UI','Helvetica','Arial','sans-serif'] 
        min-w-[180px] max-w-[280px] transition-all duration-150
        ${selected
          ? 'border-green-500 shadow-md ring-1 ring-green-200'
          : 'hover:border-green-300 hover:shadow'
        }
      `}
      style={{ position: 'relative', cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
    >
      {/* Handles de conexión - Versión refactorizada */}
      <HandleGroup position={Position.Top} idBase={`${id}-top`} offsets={handleOffsets} />
      <HandleGroup position={Position.Right} idBase={`${id}-right`} offsets={handleOffsets} />
      <HandleGroup position={Position.Bottom} idBase={`${id}-bottom`} offsets={handleOffsets} />
      <HandleGroup position={Position.Left} idBase={`${id}-left`} offsets={handleOffsets} />

      {/* Compartimento del nombre */}
      <div className="bg-green-700 text-white px-3 py-2 border-b border-green-800">
        {estereotipo && (
          <div className="text-xs text-green-100 font-light italic mb-1">
            &laquo;{estereotipo}&raquo;
          </div>
        )}
        <div className={`font-semibold text-sm ${esAbstracta ? 'italic' : ''} flex items-center justify-between`}>
          <span>{nombre}</span>
          {esAbstracta && (
            <span className="text-green-200 text-xs font-normal bg-green-800 px-2 py-0.5 rounded-full">
              abstract
            </span>
          )}
        </div>
      </div>

      {/* Compartimento de atributos */}
      {atributos.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-200 bg-white">
          <div className="mb-1">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Atributos</div>
          </div>
          <div className="space-y-1">
            {atributos.map(renderAtributo)}
          </div>
        </div>
      )}

      {/* Compartimento de métodos */}
      <div className="px-3 py-2 bg-white">
        <div className="mb-1">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Métodos</div>
        </div>
        <div className="space-y-1">
          {metodos.length > 0 ? (
            metodos.map(renderMetodo)
          ) : (
            <div className="text-gray-400 text-xs italic py-1">— sin métodos —</div>
          )}
        </div>
      </div>

      {/* Indicador visual de selección */}
      {selected && (
        <div className="absolute -inset-1 border-2 border-green-400 rounded-sm pointer-events-none"></div>
      )}
    </div>
  );
};

// Versión memoizada para optimización de rendimiento
export default React.memo(ClaseNodeRF);

