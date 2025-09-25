import React from 'react';

/**
 * Botón reutilizable para invertir la dirección de una relación UML.
 * 
 * @param {Object} props
 * @param {Function} props.onInvertir - Callback que invierte la relación.
 */
const InvertirRelacion = ({ onInvertir }) => (
  <button
    type="button"
    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
    onClick={onInvertir}
    title="Invertir dirección de la relación"
  >
    ↔ Cambiar dirección
  </button>
);

export default InvertirRelacion;