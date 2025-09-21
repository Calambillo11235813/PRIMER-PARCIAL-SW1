import React from 'react';

const elementos = [
  { tipo: 'Clase', label: 'Clase' },
  { tipo: 'Interface', label: 'Interface' },
  // Puedes agregar más tipos aquí
];

const Sidebar = ({ onDragStart }) => (
  <div className="w-40 bg-gray-100 p-3 border-r border-gray-300 h-full">
    <h3 className="font-bold text-gray-700 mb-3">Clases (UML)</h3>
    {elementos.map((el, idx) => (
      <div
        key={idx}
        draggable
        onDragStart={e => onDragStart(e, el.tipo)}
        className="mb-2 p-2 bg-white rounded shadow cursor-move hover:bg-blue-50"
      >
        {el.label}
      </div>
    ))}
  </div>
);

export default Sidebar;