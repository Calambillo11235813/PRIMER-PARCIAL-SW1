import React, { useEffect, useState } from 'react';
import { obtenerDiagramas, crearDiagrama, eliminarDiagrama } from '../../services/diagramService';

const ListaDiagramas = ({ idProyecto }) => {
  const [diagramas, setDiagramas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoDiagrama, setNuevoDiagrama] = useState({ nombre: '', descripcion: '', estructura: {} });
  const [error, setError] = useState('');

  const cargarDiagramas = async () => {
    setCargando(true);
    const resp = await obtenerDiagramas();
    // Filtra los diagramas por proyecto
    const filtrados = (resp.data || []).filter(d => d.proyecto === idProyecto);
    setDiagramas(filtrados);
    setCargando(false);
  };

  useEffect(() => {
    cargarDiagramas();
    // eslint-disable-next-line
  }, [idProyecto]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError('');
    const datos = {
      ...nuevoDiagrama,
      proyecto: idProyecto,
      estructura: nuevoDiagrama.estructura || {}
    };
    const resp = await crearDiagrama(datos);
    if (resp.error) {
      setError('No se pudo crear el diagrama.');
    } else {
      setMostrarFormulario(false);
      setNuevoDiagrama({ nombre: '', descripcion: '', estructura: {} });
      cargarDiagramas();
    }
  };

  const handleEliminar = async (idDiagrama) => {
    await eliminarDiagrama(idDiagrama);
    cargarDiagramas();
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-green-700">Diagramas de Clases</h3>
      {cargando ? (
        <div className="text-gray-500">Cargando diagramas...</div>
      ) : (
        <>
          <button
            className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => setMostrarFormulario(true)}
          >
            + Crear Diagrama
          </button>
          {diagramas.length === 0 ? (
            <div className="text-gray-500">No hay diagramas para este proyecto.</div>
          ) : (
            <ul className="space-y-3">
              {diagramas.map(diag => (
                <li key={diag.id} className="bg-white shadow rounded px-4 py-3 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-green-800">{diag.nombre}</span>
                    <p className="text-gray-600 text-sm">{diag.descripcion}</p>
                  </div>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleEliminar(diag.id)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {mostrarFormulario && (
        <form className="mt-6 bg-gray-50 p-4 rounded shadow" onSubmit={handleCrear}>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={nuevoDiagrama.nombre}
              onChange={e => setNuevoDiagrama({ ...nuevoDiagrama, nombre: e.target.value })}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={nuevoDiagrama.descripcion}
              onChange={e => setNuevoDiagrama({ ...nuevoDiagrama, descripcion: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          {/* Puedes agregar campos para estructura si lo necesitas */}
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Crear
            </button>
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => setMostrarFormulario(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ListaDiagramas;