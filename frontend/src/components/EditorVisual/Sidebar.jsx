import React from 'react';

const elementos = [
  { tipo: 'Clase', label: 'Clase' },
  { tipo: 'Interface', label: 'Interface' },
  // Puedes agregar más tipos aquí
];

const Sidebar = ({ onDragStart }) => {
  return (
    <div className="w-64 bg-white p-4 border-r">
      <h3 className="text-lg font-bold mb-4">Elementos UML</h3>
      <div
        draggable
        onDragStart={(e) => {
          console.log('DEBUG Sidebar: Drag start para Clase');  // Log
          onDragStart(e, 'Clase');
        }}
        className="p-2 bg-blue-100 rounded mb-2 cursor-move"
      >
        Clase
      </div>
      <div
        draggable
        onDragStart={(e) => {
          console.log('DEBUG Sidebar: Drag start para Interface');  // Log
          onDragStart(e, 'Interface');
        }}
        className="p-2 bg-green-100 rounded cursor-move"
      >
        Interface
      </div>
      {/* ... (resto) */}
    </div>
  );
};

export default Sidebar;