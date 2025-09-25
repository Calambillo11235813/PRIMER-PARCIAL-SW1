import React from 'react';
import ClaseNodeRF from '../ClaseNodeRF';

/**
 * Nodo visual para Clase de Asociación UML.
 * Recibe data: { nombre, atributos, metodos, ... }
 */
const ClaseAsociacionNode = ({ id, data, selected, onEdgeDragStart }) => {
  // Puedes personalizar el color o icono si lo deseas
  return (
    <div style={{ border: '2px dashed #22c55e', background: '#f0fdf4' }}>
      <ClaseNodeRF
        id={id}
        data={{ ...data, estereotipo: 'associationClass' }}
        selected={selected}
        onEdgeDragStart={onEdgeDragStart}
      />
    </div>
  );
};

export default React.memo(ClaseAsociacionNode);