import React from 'react';

const RelacionNode = ({ origen, destino, tipo }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="font-semibold text-gray-700">{origen}</span>
    <span className="text-gray-400">→</span>
    <span className="font-semibold text-gray-700">{destino}</span>
    <span className={`px-2 py-1 rounded ${tipo === 'composición' ? 'bg-black text-white' : tipo === 'generalización' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-700'}`}>
      {tipo}
    </span>
  </div>
);

export default RelacionNode;