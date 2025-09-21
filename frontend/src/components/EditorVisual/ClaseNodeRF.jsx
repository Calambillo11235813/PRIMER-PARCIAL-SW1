import React from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * Nodo de clase estilo UML 2.5 (3 compartimentos).
 * data: { nombre, estereotipo, atributos: [{vis, nombre, tipo, mult}], metodos: [{vis, nombre, firma}], color? }
 */
const ClaseNodeRF = ({ data }) => {
  const nombre = data?.nombre || 'Clase';
  const estereotipo = data?.estereotipo;
  const atributos = data?.atributos || [];
  const metodos = data?.metodos || [];

  const renderAtributo = (a, i) => {
    // a puede ser string o objeto
    if (typeof a === 'string') return <div key={i} className="uml-line">- {a}</div>;
    return (
      <div key={i} className="uml-line">
        {a.vis || '-'} {a.nombre}{a.tipo ? `: ${a.tipo}` : ''}{a.mult ? ` [${a.mult}]` : ''}
      </div>
    );
  };

  const renderMetodo = (m, i) => {
    if (typeof m === 'string') return <div key={i} className="uml-line">+ {m}()</div>;
    return (
      <div key={i} className="uml-line">
        {m.vis || '+'} {m.nombre}({m.params || ''}){m.tipo ? `: ${m.tipo}` : ''}
      </div>
    );
  };

  return (
    <div className="uml-node" style={{ width: data?.width || 240 }}>
      <Handle type="target" id="top" position={Position.Top} style={{ top: 0 }} />
      <div className="uml-header">
        {estereotipo && <div className="uml-estereotipo">&laquo;{estereotipo}&raquo;</div>}
        <div className="uml-nombre">{nombre}</div>
      </div>

      <div className="uml-compartimento">
        {atributos.length ? atributos.map(renderAtributo) : <div className="uml-empty">— sin atributos —</div>}
      </div>

      <div className="uml-compartimento">
        {metodos.length ? metodos.map(renderMetodo) : <div className="uml-empty">— sin métodos —</div>}
      </div>

      <Handle type="source" id="bottom" position={Position.Bottom} style={{ bottom: 0 }} />
      <Handle type="source" id="right" position={Position.Right} style={{ right: 0 }} />
      <Handle type="target" id="left" position={Position.Left} style={{ left: 0 }} />
    </div>
  );
};

export default ClaseNodeRF;