import React, { useState } from 'react';
import { proyectoService } from '../../services/proyectoService';

const EliminarProyecto = ({ idProyecto, nombre, onEliminado }) => {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState('');

  const handleEliminar = async () => {
    setEliminando(true);
    setError('');
    const resp = await proyectoService.eliminarProyecto(idProyecto);
    if (resp.error) {
      setError('No se pudo eliminar el proyecto.');
    } else {
      if (onEliminado) onEliminado(idProyecto);
    }
    setEliminando(false);
  };

  return (
    <div>
      <p>¿Seguro que deseas eliminar el proyecto <strong>{nombre}</strong>?</p>
      {error && <div className="text-red-600">{error}</div>}
      <button
        onClick={handleEliminar}
        disabled={eliminando}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-3"
      >
        {eliminando ? 'Eliminando...' : 'Eliminar'}
      </button>
    </div>
  );
};

export default EliminarProyecto;