import React from 'react';
import { loginWithGoogle } from '../services/authService';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl border border-green-200 overflow-hidden">
        <div className="bg-green-600 p-6">
          <h2 className="text-3xl font-bold text-white text-center">
            UML Colaborativo
          </h2>
        </div>
        
        <div className="p-8">
          <div className="mb-6">
            <p className="text-gray-700 text-center mb-6">
              Diseña diagramas UML y genera código Spring Boot automáticamente
            </p>
            <div className="h-0.5 w-16 bg-green-500 mx-auto"></div>
          </div>
          
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center group"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Iniciar sesión con Google
            <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Mes de Santa Cruz - Bolivia</p>
            <p className="mt-1 text-green-600 font-medium">¡Celebremos juntos!</p>
          </div>
        </div>
        
        <div className="h-2 bg-gradient-to-r from-green-500 via-green-400 to-green-600"></div>
      </div>
    </div>
  );
};

export default Login;