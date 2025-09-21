import React from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * Nodo de clase estilo Enterprise Architect UML 2.5 (3 compartimentos).
 * data: { nombre, estereotipo, atributos: [{vis, nombre, tipo, mult}], metodos: [{vis, nombre, firma}], color? }
 */
const ClaseNodeRF = ({ data, selected }) => {
  const nombre = data?.nombre || 'Clase';
  const estereotipo = data?.estereotipo;
  const atributos = data?.atributos || [];
  const metodos = data?.metodos || [];
  const esAbstracta = data?.esAbstracta || false;

  // Función para obtener el símbolo de visibilidad UML
  const obtenerSimboloVisibilidad = (vis) => {
    switch(vis) {
      case 'public': return '+';
      case 'private': return '-';
      case 'protected': return '#';
      case 'package': return '~';
      default: return vis || '+';
    }
  };

  // Renderizar atributo con formato UML estándar
  const renderAtributo = (a, i) => {
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
  };

  // Renderizar método con formato UML estándar
  const renderMetodo = (m, i) => {
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
  };

  return (
    <div className={`
      bg-white border border-gray-300 rounded-sm shadow-sm
      font-['Segoe_UI','Helvetica','Arial','sans-serif'] 
      min-w-[180px] max-w-[280px] transition-all duration-150
      ${selected 
        ? 'border-green-500 shadow-md ring-1 ring-green-200' 
        : 'hover:border-green-300 hover:shadow'
      }
    `}>
      {/* Handles de conexión */}
      <Handle type="target" id="top" position={Position.Top} className="w-3 h-3 bg-green-600 border-2 border-white" />
      <Handle type="source" id="bottom" position={Position.Bottom} className="w-3 h-3 bg-green-600 border-2 border-white" />
      <Handle type="target" id="left" position={Position.Left} className="w-3 h-3 bg-green-600 border-2 border-white" />
      <Handle type="source" id="right" position={Position.Right} className="w-3 h-3 bg-green-600 border-2 border-white" />

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
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <div className="mb-1">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Atributos</div>
        </div>
        <div className="space-y-1">
          {atributos.length > 0 ? (
            atributos.map(renderAtributo)
          ) : (
            <div className="text-gray-400 text-xs italic py-1">— sin atributos —</div>
          )}
        </div>
      </div>

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

export default ClaseNodeRF;