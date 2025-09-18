import React, { useState } from 'react';
import { proyectoService } from '../../services/proyectoService';

const ActualizarProyecto = ({ idProyecto, proyectoActual, onActualizado }) => {
  const [datos, setDatos] = useState({
    nombre: proyectoActual?.nombre || '',
    descripcion: proyectoActual?.descripcion || '',
  });
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const handleActualizar = async (e) => {
    e.preventDefault();
    setActualizando(true);
    setError('');
    const resp = await proyectoService.actualizarProyecto(idProyecto, datos);
    if (resp.error) {
      setError('No se pudo actualizar el proyecto.');
    } else {
      if (onActualizado) onActualizado(resp.data);
    }
    setActualizando(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleActualizar}>
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={datos.nombre}
          onChange={e => setDatos({ ...datos, nombre: e.target.value })}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={datos.descripcion}
          onChange={e => setDatos({ ...datos, descripcion: e.target.value })}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <button
        type="submit"
        disabled={actualizando}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {actualizando ? 'Actualizando...' : 'Actualizar'}
      </button>
    </form>
  );
};

export default ActualizarProyecto;