import React, { useEffect, useState } from 'react';
import { getCurrentUser } from './services/authService';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Herramienta UML</h1>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user.email}</span>
            <button 
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors text-sm"
              onClick={() => {
                window.location.href = 'http://127.0.0.1:8000/auth/logout/';
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-green-200">
          <h2 className="text-xl font-bold text-green-800 mb-4">Bienvenido, {user.first_name || user.username || user.email}</h2>
          <p className="text-gray-600">
            Comienza a crear y colaborar en diagramas UML.
          </p>
          
          {/* Aquí irá el contenido principal de la aplicación */}
          <div className="mt-8 p-4 bg-green-50 rounded-md border border-green-200">
            <p className="text-center text-green-700">
              Contenido de la aplicación...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

