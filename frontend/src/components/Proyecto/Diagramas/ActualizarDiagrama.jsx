import React, { useState, useEffect } from 'react';
import { obtenerDiagramaPorId, actualizarDiagrama } from '../../../services/diagramService';

const ActualizarDiagrama = ({ idDiagrama, onActualizado, onCancelar }) => {
  const [datos, setDatos] = useState({ nombre: '', descripcion: '', estructura: {} });
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const resp = await obtenerDiagramaPorId(idDiagrama);
      if (resp.data) setDatos(resp.data);
      setCargando(false);
    };
    if (idDiagrama) cargar();
  }, [idDiagrama]);

  const handleActualizar = async (e) => {
    e.preventDefault();
    setActualizando(true);
    setError('');
    const resp = await actualizarDiagrama(idDiagrama, datos);
    if (resp.error) {
      setError('No se pudo actualizar el diagrama.');
    } else {
      if (onActualizado) onActualizado(resp.data);
    }
    setActualizando(false);
  };

  if (cargando) return <div>Cargando datos...</div>;

  return (
    <form className="bg-white rounded shadow p-6 max-w-xl mx-auto mt-6" onSubmit={handleActualizar}>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <h2 className="text-xl font-bold mb-4 text-green-800">Editar Diagrama</h2>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={datos.nombre}
          onChange={e => setDatos({ ...datos, nombre: e.target.value })}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={datos.descripcion}
          onChange={e => setDatos({ ...datos, descripcion: e.target.value })}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Estructura (JSON)</label>
        <textarea
          value={JSON.stringify(datos.estructura, null, 2)}
          onChange={e => {
            try {
              setDatos({ ...datos, estructura: JSON.parse(e.target.value) });
              setError('');
            } catch {
              setError('El campo estructura debe ser un JSON válido.');
            }
          }}
          className="border rounded px-3 py-2 w-full font-mono"
          rows={6}
        />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={actualizando}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {actualizando ? 'Actualizando...' : 'Actualizar'}
        </button>
        <button
          type="button"
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={onCancelar}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ActualizarDiagrama;