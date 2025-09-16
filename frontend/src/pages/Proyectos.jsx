import React, { useState, useEffect } from 'react';
import { proyectoService } from '../services/proyectoService.js';

const Proyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', descripcion: '' });
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      const respuesta = await proyectoService.obtenerProyectos();
      setProyectos(respuesta.data || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      alert('Error al cargar proyectos.');
    }
  };

  const manejarCrear = async (e) => {
    e.preventDefault();
    if (!nuevoProyecto.nombre.trim()) return alert('El nombre es obligatorio.');
    setCargando(true);
    try {
      await proyectoService.crearProyecto(nuevoProyecto);
      setNuevoProyecto({ nombre: '', descripcion: '' });
      cargarProyectos();  // Recargar lista
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      alert('Error al crear proyecto.');
    } finally {
      setCargando(false);
    }
  };

  const manejarEditar = (proyecto) => {
    setEditando(proyecto.id);
    setNuevoProyecto({ nombre: proyecto.nombre, descripcion: proyecto.descripcion });
  };

  const manejarActualizar = async (e) => {
    e.preventDefault();
    if (!nuevoProyecto.nombre.trim()) return alert('El nombre es obligatorio.');
    setCargando(true);
    try {
      await proyectoService.actualizarProyecto(editando, nuevoProyecto);
      setEditando(null);
      setNuevoProyecto({ nombre: '', descripcion: '' });
      cargarProyectos();
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      alert('Error al actualizar proyecto.');
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;
    try {
      await proyectoService.eliminarProyecto(id);
      cargarProyectos();
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      alert('Error al eliminar proyecto.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Gestión de Proyectos UML</h1>

      {/* Formulario para crear/editar */}
      <form onSubmit={editando ? manejarActualizar : manejarCrear} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">{editando ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre</label>
          <input
            type="text"
            value={nuevoProyecto.nombre}
            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nombre del proyecto"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Descripción</label>
          <textarea
            value={nuevoProyecto.descripcion}
            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Descripción del proyecto"
            rows="3"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
        </button>
        {editando && (
          <button
            type="button"
            onClick={() => { setEditando(null); setNuevoProyecto({ nombre: '', descripcion: '' }); }}
            className="ml-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyectos.map((proyecto) => (
          <div key={proyecto.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-green-700">{proyecto.nombre}</h3>
            <p className="text-gray-600 mb-4">{proyecto.descripcion || 'Sin descripción'}</p>
            <p className="text-sm text-gray-500">Creador: {proyecto.creador || 'Anónimo'}</p>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => manejarEditar(proyecto)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => manejarEliminar(proyecto.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Proyectos;