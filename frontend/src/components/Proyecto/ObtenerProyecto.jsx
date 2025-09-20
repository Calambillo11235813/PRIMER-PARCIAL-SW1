import React, { useEffect, useState } from 'react';
import { proyectoService } from '../../services/proyectoService';
import ListaDiagramas from './ListaDiagramas';

const ObtenerProyecto = ({ idProyecto, onVolver }) => {
  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const resp = await proyectoService.obtenerProyectoPorId(idProyecto);
      setProyecto(resp.data);
      setCargando(false);
    };
    if (idProyecto) cargar();
  }, [idProyecto]);

  if (cargando) return <div>Cargando proyecto...</div>;
  if (!proyecto) return <div>No se encontró el proyecto.</div>;

  return (
    <div className="bg-white rounded shadow p-6 max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-green-800 mb-2">{proyecto.nombre}</h2>
      <p className="mb-4 text-gray-700">{proyecto.descripcion}</p>
      {/* Integración de la lista de diagramas */}
      <ListaDiagramas idProyecto={proyecto.id} />
      <button
        className="mt-6 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        onClick={onVolver}
      >
        Volver
      </button>
    </div>
  );
};

export default ObtenerProyecto;