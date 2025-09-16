import React, { useEffect, useState } from 'react';
import { getCurrentUser, logout } from './services/authService';
import Login from './components/Login';
import Navbar from './components/Navbar';
import PerfilUsuario from './pages/PerfilUsuario';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = (email) => {
    setUser({ email });
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      setUser(null);
      setMostrarPerfil(false);
    }
  };

  const handleIrPerfil = () => {
    setMostrarPerfil(true);
  };

  const handleVolver = () => {
    setMostrarPerfil(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-green-800">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar usuario={user} onLogout={handleLogout} onIrPerfil={handleIrPerfil} />
      <main className="container mx-auto p-4 mt-6">
        {mostrarPerfil ? (
          <div>
            <button
              onClick={handleVolver}
              className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Volver
            </button>
            <PerfilUsuario usuario={user} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-green-200">
            <h2 className="text-xl font-bold text-green-800 mb-4">
              Bienvenido, {user.first_name || user.username || user.email}
            </h2>
            <p className="text-gray-600">
              Comienza a crear y colaborar en diagramas UML.
            </p>
            <div className="mt-8 p-4 bg-green-50 rounded-md border border-green-200">
              <p className="text-center text-green-700">
                Contenido de la aplicación...
              </p>
              <button
                onClick={handleIrPerfil}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Ir a mi perfil
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

