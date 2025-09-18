import React, { useEffect, useState } from 'react';
import { proyectoService } from '../../services/proyectoService';

const ObtenerProyecto = ({ idProyecto }) => {
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{proyecto.nombre}</h2>
      <p className="mb-2">{proyecto.descripcion}</p>
      <p className="text-sm text-gray-500">Creado por: {proyecto.creador}</p>
      <p className="text-sm text-gray-500">Fecha de creación: {proyecto.fecha_creacion}</p>
    </div>
  );
};

export default ObtenerProyecto;