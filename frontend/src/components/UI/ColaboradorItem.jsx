import React from 'react';
import { User, Trash2 } from 'lucide-react';

const ColaboradorItem = ({ colaborador, onEliminar }) => (
  <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded mb-2">
    <div className="flex items-center gap-2">
      <User className="text-green-600" />
      <span>{colaborador}</span>
    </div>
    {onEliminar && (
      <button
        onClick={() => onEliminar(colaborador)}
        className="text-red-600 hover:text-red-800"
        title="Eliminar colaborador"
      >
        <Trash2 />
      </button>
    )}
  </div>
);

export default ColaboradorItem;