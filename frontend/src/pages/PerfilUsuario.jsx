import React, { useState, useEffect } from 'react';

const PerfilUsuario = ({ usuario }) => {
  const [editando, setEditando] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    correo_electronico: '',
    fecha_nacimiento: '',
    telefono: '',
  });

  useEffect(() => {
    console.log('Usuario autenticado:', usuario);
    const datosUsuario = Array.isArray(usuario) ? usuario[0] : usuario;
    if (datosUsuario) {
      setFormulario({
        nombre: datosUsuario?.nombre || '',
        apellido: datosUsuario?.apellido || '',
        correo_electronico: datosUsuario?.correo_electronico || '',
        fecha_nacimiento: datosUsuario?.fecha_nacimiento || '',
        telefono: datosUsuario?.telefono || '',
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditar = () => setEditando(true);
  const handleCancelar = () => setEditando(false);

  const handleGuardar = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar los cambios en el backend
    setEditando(false);
  };

  if (!usuario) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-green-700">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-8 border border-green-200">
      <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Perfil de Usuario</h2>
      <form onSubmit={handleGuardar} className="space-y-4">
        <div>
          <label className="block text-green-800 font-medium mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={handleChange}
            disabled={!editando}
            className="w-full border border-green-300 rounded-md px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-green-800 font-medium mb-1">Apellido</label>
          <input
            type="text"
            name="apellido"
            value={formulario.apellido}
            onChange={handleChange}
            disabled={!editando}
            className="w-full border border-green-300 rounded-md px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-green-800 font-medium mb-1">Correo electrónico</label>
          <input
            type="email"
            name="correo_electronico"
            value={formulario.correo_electronico}
            disabled
            className="w-full border border-green-300 rounded-md px-4 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-green-800 font-medium mb-1">Fecha de nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formulario.fecha_nacimiento}
            onChange={handleChange}
            disabled={!editando}
            className="w-full border border-green-300 rounded-md px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-green-800 font-medium mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formulario.telefono}
            onChange={handleChange}
            disabled={!editando}
            className="w-full border border-green-300 rounded-md px-4 py-2"
          />
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          {!editando ? (
            <button
              type="button"
              onClick={handleEditar}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Editar perfil
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancelar}
                className="bg-gray-300 hover:bg-gray-400 text-green-800 px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default PerfilUsuario;