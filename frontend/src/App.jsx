import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getCurrentUser, logout, login } from './services/authService';
import { apiClient, API_ENDPOINTS } from './services/apiConfig';
import Login from './components/Login';
import Navbar from './components/Navbar';
import PerfilUsuario from './pages/PerfilUsuario';
import Registro from './components/Registro';
import Dashboard from './components/Dashboard';
import ListaProyectos from './components/Proyecto/ListaProyectos';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  useEffect(() => {
    // Si tienes CSRF en el backend, puedes eliminar esta línea con JWT puro
    // apiClient.get(API_ENDPOINTS.CSRF).then(() => {
    //   console.log('CSRF cookie establecida');
    // });

    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = async (correo_electronico, password) => {
    try {
      const respuesta = await login(correo_electronico, password);
      if (respuesta && respuesta.access) {
        const usuarioActual = await getCurrentUser();
        setUser(usuarioActual);
        setMostrarRegistro(false);
      }
    } catch (err) {
      // Puedes mostrar un mensaje de error aquí si lo necesitas
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setMostrarPerfil(false);
  };

  const handleIrPerfil = () => {
    setMostrarPerfil(true);
  };

  const handleVolver = () => {
    setMostrarPerfil(false);
  };

  const handleVolverLogin = () => {
    setMostrarRegistro(false);
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

  if (!user && mostrarRegistro) {
    return <Registro onVolver={handleVolverLogin} />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} onMostrarRegistro={() => setMostrarRegistro(true)} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-green-50">
        {user && <Navbar usuario={user} onLogout={handleLogout} onIrPerfil={handleIrPerfil} />}
        <main className="container mx-auto p-4 mt-6">
          <Routes>
            <Route
              path="/"
              element={
                !user ? (
                  <Login onLogin={handleLogin} onMostrarRegistro={() => setMostrarRegistro(true)} />
                ) : mostrarPerfil ? (
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
                  <Dashboard user={user} onIrPerfil={handleIrPerfil} />
                )
              }
            />
            <Route path="/registro" element={<Registro onVolver={handleVolverLogin} />} />
            <Route path="/proyectos" element={<ListaProyectos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
