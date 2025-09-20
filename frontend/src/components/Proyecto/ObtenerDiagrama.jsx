import React, { useEffect, useState } from 'react';
import { obtenerDiagramaPorId } from '../../services/diagramService';

const ObtenerDiagrama = ({ idDiagrama, onVolver }) => {
  const [diagrama, setDiagrama] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const resp = await obtenerDiagramaPorId(idDiagrama);
      setDiagrama(resp.data);
      setCargando(false);
    };
    if (idDiagrama) cargar();
  }, [idDiagrama]);

  if (cargando) return <div>Cargando diagrama...</div>;
  if (!diagrama) return <div>No se encontró el diagrama.</div>;

  return (
    <div className="bg-white rounded shadow p-6 max-w-xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-green-800 mb-2">{diagrama.nombre}</h2>
      <p className="mb-2 text-gray-700">{diagrama.descripcion}</p>
      <div className="mb-4">
        <h3 className="font-semibold text-green-700 mb-1">Estructura (JSON)</h3>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
          {JSON.stringify(diagrama.estructura, null, 2)}
        </pre>
      </div>
      <button
        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        onClick={onVolver}
      >
        Volver
      </button>
    </div>
  );
};

export default ObtenerDiagrama;