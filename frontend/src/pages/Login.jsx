import React, { useState } from 'react';
import { login } from '../services/authService';

const Login = ({ onLogin, onMostrarRegistro }) => {
  const [correo_electronico, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(correo_electronico, password);
    } catch (err) {
      setError(err.message); // Mostrar el mensaje de error al usuario
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl border border-green-200 overflow-hidden">
        <div className="bg-green-600 p-6">
          <h2 className="text-3xl font-bold text-white text-center">
            UML Colaborativo
          </h2>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo_electronico}
              onChange={e => setCorreo(e.target.value)}
              className="w-full border border-green-300 rounded-md px-4 py-2"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-green-300 rounded-md px-4 py-2"
              required
            />
            {error && <div className="text-red-600 text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              Iniciar sesión
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Mes de Santa Cruz - Bolivia</p>
            <p className="mt-1 text-green-600 font-medium">¡Celebremos juntos!</p>
            <button
              type="button"
              className="mt-4 text-green-700 underline"
              onClick={onMostrarRegistro}
            >
              ¿Desea registrarse?
            </button>
          </div>
        </div>
        
        <div className="h-2 bg-gradient-to-r from-green-500 via-green-400 to-green-600"></div>
      </div>
    </div>
  );
};

export default Login;