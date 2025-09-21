import React from 'react';

const Toolbar = ({ onAgregarClase, onAgregarRelacion }) => (
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
  </div>
);

export default Toolbar;