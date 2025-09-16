import React from 'react';
import { Link } from 'react-router-dom';  // Importa Link para navegación con React Router

const Navbar = ({ usuario, onLogout, onIrPerfil }) => {
  return (
    <nav className="bg-green-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-xl">UML Colaborativo</span>
        <Link to="/proyectos" className="hover:underline">Proyectos</Link>  // Cambia a Link para navegación
        <a href="/diagramas" className="hover:underline">Diagramas</a>
        <button
          onClick={onIrPerfil}
          className="hover:underline bg-transparent border-none text-white cursor-pointer"
        >
          Perfil
        </button>
      </div>
      <div className="flex items-center space-x-4">
        {usuario && <span>{usuario.correo_electronico}</span>}
        <button
          onClick={onLogout}
          className="bg-green-700 hover:bg-green-800 px-3 py-1 rounded transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;