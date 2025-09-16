import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getCurrentUser, logout } from './services/authService';
import Login from './components/Login';
import Navbar from './components/Navbar';
import PerfilUsuario from './pages/PerfilUsuario';
import Registro from './components/Registro';
import Proyectos from './pages/Proyectos';
import Dashboard from './components/Dashboard'; // Importar el nuevo Dashboard

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  useEffect(() => {
    console.log('App.jsx: Iniciando fetchUser');  // Log 1: Inicio del useEffect
    const fetchUser = async () => {
      console.log('App.jsx: Llamando a getCurrentUser');  // Log 2: Antes de llamar
      try {
        const userData = await getCurrentUser();
        console.log('Datos de getCurrentUser en App.jsx:', userData);  // Log 3: Después de llamar
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

  const handleLogin = async (email, password) => {
    try {
      const usuarioDesdeLogin = await login(email, password); // usa authService.login
      // intentar obtener usuario definitivo desde /api/me
      let usuarioActual = null;
      try {
        usuarioActual = await getCurrentUser();
      } catch (_) {
        usuarioActual = null;
      }
      // si getCurrentUser falla, usar la info del login (contiene nombre/apellido si el backend la retorna)
      setUser(usuarioActual ?? usuarioDesdeLogin ?? { email });
    } catch (err) {
      // manejar error de login
    }
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
    return <Login onLogin={handleLogin} />;
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
                  <Login onLogin={handleLogin} />
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
            <Route path="/registro" element={<Registro />} />
            <Route path="/proyectos" element={<Proyectos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;