import React from 'react';

const Toolbar = ({ onAgregarClase, onAgregarRelacion, handleGuardarRelaciones }) => (
  <div className="flex gap-3 mb-4">
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      onClick={onAgregarClase}
    >
      + Clase
    </button>
    <button
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      onClick={onAgregarRelacion}
    >
      + Relación
    </button>
    <button
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2"
      onClick={handleGuardarRelaciones}
    >
      Guardar Relaciones
    </button>
  </div>
);

export default Toolbar;