import React from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * Nodo de clase estilo Enterprise Architect UML 2.5 (3 compartimentos).
 * data: { nombre, estereotipo, atributos: [{vis, nombre, tipo, mult}], metodos: [{vis, nombre, firma}], color? }
 */
const ClaseNodeRF = ({ id, data, selected }) => {
  const nombre = data?.nombre || 'Clase';
  const estereotipo = data?.estereotipo;
  const atributos = data?.atributos || [];
  const metodos = data?.metodos || [];
  const esAbstracta = data?.esAbstracta || false;

  // Función para obtener el símbolo de visibilidad UML
  const obtenerSimboloVisibilidad = (vis) => {
    switch (vis) {
      case 'public': return '+';
      case 'private': return '-';
      case 'protected': return '#';
      case 'package': return '~';
      default: return vis || '+';
    }
  };

  // Nuevo: función para iniciar el drag
  const handleMouseDown = (e) => {
    //si el evento viene de la flecha no hagas nada 
    if (e.target.id == `arrow-${id}`) {

      return;
    }
    e.stopPropagation();

    // Llama a una función global/contexto para iniciar la conexión
    if (window.startEdgeDrag) window.startEdgeDrag(id, e);
  };

  // Nuevo: función para iniciar el drag desde la flecha
  const handleArrowMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (window.startEdgeDrag) window.startEdgeDrag(id, e);
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

   const handleStyle = {width: 10, height: 10, background: '#22c55e', border: '2px solid #fff', borderRadius: '50%' };

  return (
    <div
      id={id} // 👈 necesario para drag & drop
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


      {/* Handles de conexión */}
      {/* Handles de conexión */}
      {/* TOP - ids namespaced por nodo y por tipo (src/tgt) */}
      <Handle
        type="source"
        id={`${id}-top-src-1`}
        position={Position.Top}
        style={{ left: '15%', ...handleStyle }}
        onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-top-src-1`, id); }}
      />
      <Handle
        type="source"
        id={`${id}-top-src-2`}
        position={Position.Top}
        style={{ left: '35%', ...handleStyle }}
        onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-top-src-2`, id); }}
      />
      <Handle
        type="source"
        id={`${id}-top-src-3`}
        position={Position.Top}
        style={{ left: '65%', ...handleStyle }}
        onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-top-src-3`, id); }}
      />
      <Handle
        type="source"
        id={`${id}-top-src-4`}
        position={Position.Top}
        style={{ left: '85%', ...handleStyle }}
        onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-top-src-4`, id); }}
      />
      <Handle type="target" id={`${id}-top-tgt-1`} position={Position.Top} style={{ left: '15%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-top-tgt-1`, id); }} />
      <Handle type="target" id={`${id}-top-tgt-2`} position={Position.Top} style={{ left: '35%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-top-tgt-2`, id); }} />
      <Handle type="target" id={`${id}-top-tgt-3`} position={Position.Top} style={{ left: '65%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-top-tgt-3`, id); }} />
      <Handle type="target" id={`${id}-top-tgt-4`} position={Position.Top} style={{ left: '85%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-top-tgt-4`, id); }} />

      {/* RIGHT */} 
      <Handle type="source" id={`${id}-right-src-1`} position={Position.Right} style={{ top: '15%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-right-src-1`, id); }} />
      <Handle type="source" id={`${id}-right-src-2`} position={Position.Right} style={{ top: '35%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-right-src-2`, id); }} />
      <Handle type="source" id={`${id}-right-src-3`} position={Position.Right} style={{ top: '65%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-right-src-3`, id); }} />
      <Handle type="source" id={`${id}-right-src-4`} position={Position.Right} style={{ top: '85%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-right-src-4`, id); }} />
      <Handle type="target" id={`${id}-right-tgt-1`} position={Position.Right} style={{ top: '15%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-right-tgt-1`, id); }} />
      <Handle type="target" id={`${id}-right-tgt-2`} position={Position.Right} style={{ top: '35%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-right-tgt-2`, id); }} />
      <Handle type="target" id={`${id}-right-tgt-3`} position={Position.Right} style={{ top: '65%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-right-tgt-3`, id); }} />
      <Handle type="target" id={`${id}-right-tgt-4`} position={Position.Right} style={{ top: '85%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-right-tgt-4`, id); }} />

      {/* BOTTOM */} 
      <Handle type="source" id={`${id}-bottom-src-1`} position={Position.Bottom} style={{ left: '15%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-bottom-src-1`, id); }} />
      <Handle type="source" id={`${id}-bottom-src-2`} position={Position.Bottom} style={{ left: '35%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-bottom-src-2`, id); }} />
      <Handle type="source" id={`${id}-bottom-src-3`} position={Position.Bottom} style={{ left: '65%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-bottom-src-3`, id); }} />
      <Handle type="source" id={`${id}-bottom-src-4`} position={Position.Bottom} style={{ left: '85%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-bottom-src-4`, id); }} />
      <Handle type="target" id={`${id}-bottom-tgt-1`} position={Position.Bottom} style={{ left: '15%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-bottom-tgt-1`, id); }} />
      <Handle type="target" id={`${id}-bottom-tgt-2`} position={Position.Bottom} style={{ left: '35%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-bottom-tgt-2`, id); }} />
      <Handle type="target" id={`${id}-bottom-tgt-3`} position={Position.Bottom} style={{ left: '65%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-bottom-tgt-3`, id); }} />
      <Handle type="target" id={`${id}-bottom-tgt-4`} position={Position.Bottom} style={{ left: '85%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-bottom-tgt-4`, id); }} />

      {/* LEFT */}
      <Handle type="source" id={`${id}-left-src-1`} position={Position.Left} style={{ top: '15%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-left-src-1`, id); }} />
      <Handle type="source" id={`${id}-left-src-2`} position={Position.Left} style={{ top: '35%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-left-src-2`, id); }} />
      <Handle type="source" id={`${id}-left-src-3`} position={Position.Left} style={{ top: '65%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-left-src-3`, id); }} />
      <Handle type="source" id={`${id}-left-src-4`} position={Position.Left} style={{ top: '85%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-left-src-4`, id); }} />
      <Handle type="target" id={`${id}-left-tgt-1`} position={Position.Left} style={{ top: '15%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-left-tgt-1`, id); }} />
      <Handle type="target" id={`${id}-left-tgt-2`} position={Position.Left} style={{ top: '35%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-left-tgt-2`, id); }} />
      <Handle type="target" id={`${id}-left-tgt-3`} position={Position.Left} style={{ top: '65%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-left-tgt-3`, id); }} />
      <Handle type="target" id={`${id}-left-tgt-4`} position={Position.Left} style={{ top: '85%', ...handleStyle }} onClick={() => { if (window.assignSelectedEdge) window.assignSelectedEdge(`${id}-left-tgt-4`, id); }} />


     



      { /*
      <Handle type="target" id="top" position={Position.Top} className="w-3 h-3 bg-green-600 border-2 border-white" />
      <Handle type="source" id="bottom" position={Position.Bottom} className="w-3 h-3 bg-green-600 border-2 border-white" />
      <Handle type="target" id="left" position={Position.Left} className="w-3 h-3 bg-green-600 border-2 border-white" />
      <Handle type="source" id="right" position={Position.Right} className="w-3 h-3 bg-green-600 border-2 border-white" />
        */}


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