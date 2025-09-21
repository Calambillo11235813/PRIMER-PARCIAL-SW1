import React, { useCallback } from 'react';

export const ClaseNodeWidget = ({ engine, node }) => {
  const { nombre, atributos, metodos, esAbstracta } = node.getOptions();

  const onEdit = useCallback(() => {
    engine.fireEvent({ node }, 'editClase');
  }, [engine, node]);

  return (
    <div style={{ background: 'yellow', border: '4px solid red', minWidth: 200, minHeight: 80 }}>
      {/* Compartimento del Nombre */}
      <div 
        className="font-bold text-center py-2 border-b-2 border-green-700 bg-green-100 text-green-900"
        onClick={onEdit}
      >
        {esAbstracta ? <i>{nombre}</i> : nombre}
      </div>
      
      {/* Compartimento de Atributos */}
      {atributos && atributos.length > 0 && (
        <div className="py-2 border-b border-green-200 bg-white">
          <ul className="ml-2 text-green-800">
            {atributos.map((attr, idx) => (
              <li key={idx}>+ {attr}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Compartimento de Métodos */}
      {metodos && metodos.length > 0 && (
        <div className="py-2 bg-white">
          <ul className="ml-2 text-green-700">
            {metodos.map((method, idx) => (
              <li key={idx}># {method}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};