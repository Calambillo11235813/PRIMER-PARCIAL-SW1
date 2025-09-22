// EditarRelacionModal.jsx
import React, { useState, useEffect } from 'react';

const EditarRelacionModal = ({ relacion, onGuardar, onCancelar }) => {
  const [tipo, setTipo] = useState('asociacion');
  const [multiplicidadSource, setMultiplicidadSource] = useState('1');
  const [multiplicidadTarget, setMultiplicidadTarget] = useState('N');

  useEffect(() => {
    if (relacion) {
      setTipo(relacion.data?.tipo || 'asociacion');
      setMultiplicidadSource(relacion.data?.multiplicidadSource || '1');
      setMultiplicidadTarget(relacion.data?.multiplicidadTarget || 'N');
    }
  }, [relacion]);

  const handleGuardar = () => {
    onGuardar({
      ...relacion,
      data: {
        ...relacion.data,
        tipo,
        multiplicidadSource,
        multiplicidadTarget,
      },
    });
  };

  const opcionesMultiplicidad = ['1', 'N', '0..1', '1..*', '0..*', '*'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-green-800 mb-4">Editar Relación</h2>
          
          {/* Tipo de Relación */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relación
            </label>
            <select 
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="asociacion">Asociación</option>
              <option value="composicion">Composición</option>
              <option value="agregacion">Agregación</option>
              <option value="herencia">Herencia</option>
              <option value="realizacion">Realización</option>
              <option value="dependencia">Dependencia</option>
            </select>
          </div>

          {/* Multiplicidad Origen */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Multiplicidad Origen
            </label>
            <select 
              value={multiplicidadSource}
              onChange={(e) => setMultiplicidadSource(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {opcionesMultiplicidad.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          {/* Multiplicidad Destino */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Multiplicidad Destino
            </label>
            <select 
              value={multiplicidadTarget}
              onChange={(e) => setMultiplicidadTarget(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {opcionesMultiplicidad.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancelar}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarRelacionModal;