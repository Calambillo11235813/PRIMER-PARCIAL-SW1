import React from 'react';

const PlantillaCard = ({ nombre, descripcion, icono, seleccionada, onClick }) => (
  <div
    className={`border rounded-lg p-4 cursor-pointer transition-colors
      ${seleccionada ? 'border-green-600 bg-green-50' : 'border-gray-300'}
    `}
    onClick={onClick}
  >
    <div className="flex items-center mb-2">
      <span className="text-2xl mr-2">{icono}</span>
      <span className="font-semibold text-lg">{nombre}</span>
    </div>
    <p className="text-gray-600">{descripcion}</p>
  </div>
);

export default PlantillaCard;