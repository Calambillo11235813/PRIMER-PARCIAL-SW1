import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { proyectoService } from '../../services/proyectoService';

const CrearProyecto = ({ isOpen, onClose, onProyectoCreado }) => {
  const [datosProyecto, setDatosProyecto] = useState({
    nombre: '',
    descripcion: '',
  });
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');

  const handleCrearProyecto = async (e) => {
    e.preventDefault();
    setError('');
    setCreando(true);
    try {
      const respuesta = await proyectoService.crearProyecto(datosProyecto);
      if (respuesta.error) {
        setError('No se pudo crear el proyecto. Verifica los datos.');
      } else {
        if (onProyectoCreado) onProyectoCreado(respuesta.data);
        if (onClose) onClose();
      }
    } catch (err) {
      setError('Error inesperado al crear el proyecto.');
    } finally {
      setCreando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-green-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Crear Nuevo Proyecto</h2>
          <p className="text-green-100">Ingresa los datos básicos de tu proyecto UML</p>
        </div>
        {/* Formulario */}
        <form className="p-6 space-y-6" onSubmit={handleCrearProyecto}>
          {error && (
            <div className="mb-4 text-red-600 font-semibold">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              value={datosProyecto.nombre}
              onChange={(e) => setDatosProyecto({ ...datosProyecto, nombre: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Sistema E-commerce Navideño"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={datosProyecto.descripcion}
              onChange={(e) => setDatosProyecto({ ...datosProyecto, descripcion: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe brevemente tu proyecto..."
              rows="3"
            />
          </div>
          <button
            type="submit"
            disabled={creando}
            className="flex items-center space-x-2 px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
          >
            <Check className="w-4 h-4" />
            <span>{creando ? 'Creando...' : 'Crear Proyecto'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearProyecto;