import React from 'react';

const BotonNavegacion = ({ texto, onClick, disabled, tipo = 'primary' }) => {
  const estilos = tipo === 'primary'
    ? 'bg-green-600 hover:bg-green-700 text-white'
    : 'bg-gray-200 hover:bg-gray-300 text-gray-700';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2 rounded-lg font-semibold transition-colors ${estilos} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {texto}
    </button>
  );
};

export default BotonNavegacion;