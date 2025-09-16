import React, { useState } from 'react';
import { crearUsuario } from '../services/usuarioService';
import { useNavigate } from 'react-router-dom';

const Registro = () => {
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    correo_electronico: '',
    fecha_nacimiento: '',
    telefono: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      await crearUsuario(formulario);
      setExito('Usuario registrado exitosamente. Redirigiendo...');
      setTimeout(() => {
        navigate('/'); // Redirige a la ruta principal
      }, 1000);
    } catch (err) {
      setError('Error al registrar usuario. Verifique los datos.');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl border border-green-200 overflow-hidden">
        <div className="bg-green-600 p-6">
          <h2 className="text-3xl font-bold text-white text-center">
            Registro de Usuario
          </h2>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formulario.nombre}
              onChange={handleChange}
              className="w-full border border-green-300 rounded-md px-4 py-2"
              required
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formulario.apellido}
              onChange={handleChange}
              className="w-full border border-green-300 rounded-md px-4 py-2"
              required
            />
            <input
              type="email"
              name="correo_electronico"
              placeholder="Correo electrónico"
              value={formulario.correo_electronico}
              onChange={handleChange}
              className="w-full border border-green-300 rounded-md px-4 py-2"
              required
            />
            <input
              type="date"
              name="fecha_nacimiento"
              placeholder="Fecha de nacimiento"
              value={formulario.fecha_nacimiento}
              onChange={handleChange}
              className="w-full border border-green-300 rounded-md px-4 py-2"
            />
            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={formulario.telefono}
              onChange={handleChange}
              className="w-full border border-green-300 rounded-md px-4 py-2"
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formulario.password}
              onChange={handleChange}
              className="w-full border border-green-300 rounded-md px-4 py-2"
              required
            />
            {error && <div className="text-red-600 text-center">{error}</div>}
            {exito && <div className="text-green-600 text-center">{exito}</div>}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              Registrarse
            </button>
          </form>
        </div>
        <div className="h-2 bg-gradient-to-r from-green-500 via-green-400 to-green-600"></div>
      </div>
    </div>
  );
};

export default Registro;  