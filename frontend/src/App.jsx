import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, login } from './services/authService';
import { apiClient, API_ENDPOINTS } from './services/apiConfig';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import PerfilUsuario from './pages/PerfilUsuario';
import Registro from './pages/Registro';
import Dashboard from './components/Dashboard';
import ListaProyectos from './components/Proyecto/ListaProyectos';
import EditorDiagrama from './components/EditorVisual/EditorDiagrama';
import ListaDiagramas from './components/Proyecto/Diagramas/ListaDiagramas';
import EditorDiagramaPage from './pages/EditorDiagramaPage';  // Nuevo import


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // NOTE: removed global popstate sync — navigation should be handled by router/components

  

  useEffect(() => {
    console.log('App: location changed ->', location.pathname, 'state=', location.state, 'history.length=', window.history.length);
  }, [location]);


  

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
        navigate('/'); // Redirigir al dashboard después de iniciar sesión
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
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
    <div className="min-h-screen bg-green-50">
      {user && <Navbar usuario={user} onLogout={handleLogout} onIrPerfil={handleIrPerfil} />}
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard user={user} onIrPerfil={handleIrPerfil} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} onMostrarRegistro={() => setMostrarRegistro(true)} />} />
          <Route path="/registro" element={<Registro onVolver={handleVolverLogin} />} />
          <Route path="/proyectos" element={<ListaProyectos />} />
          <Route path="/editor" element={<EditorDiagramaPage />} />
          <Route path="/diagramas" element={<ListaDiagramas />} />
          <Route path="/editor/:idDiagrama" element={<EditorDiagramaPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
