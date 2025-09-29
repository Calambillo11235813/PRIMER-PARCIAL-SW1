import React, { useEffect, useState } from 'react';
import { proyectoService } from '../../services/proyectoService';
import { getToken } from '../../services/authService'; // <-- nuevo import
import { useNavigate } from 'react-router-dom';
import ObtenerProyecto from './ObtenerProyecto';
import ActualizarProyecto from './ActualizarProyecto';
import EliminarProyecto from './EliminarProyecto';
import CrearProyecto from './CrearProyecto';

function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const ListaProyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [modo, setModo] = useState('lista'); // 'ver', 'editar', 'eliminar', 'crear'
  const navigate = useNavigate(); // para redirecciones opcionales

  const cargarProyectos = async () => {
    setCargando(true);
    const token = getToken();
    console.log('ListaProyectos:cargarProyectos token=', token);

    // Si tu API requiere auth para listar proyectos y no hay token, redirigir a login
    // Descomenta la siguiente línea si quieres forzar login:
    // if (!token) return navigate('/login');

    let userId = null;
    if (token) {
      try {
        const payload = parseJwt(token);
        userId = payload?.user_id || payload?.id || payload?.sub || null;
      } catch (e) {
        userId = null;
      }
    }

    const resp = await proyectoService.obtenerProyectos(userId);
    console.log('ListaProyectos: respuesta obtenerProyectos =>', resp && resp.data ? { status: resp.status, length: (resp.data || []).length } : resp);
    setProyectos(resp.data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  const handleCreado = (nuevo) => {
    setModo('lista');
    cargarProyectos();
  };

  const handleActualizado = (actualizado) => {
    setModo('lista');
    cargarProyectos();
  };

  const handleEliminado = () => {
    setModo('lista');
    cargarProyectos();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-green-800">Proyectos UML</h2>
      {modo === 'lista' && (
        <>
          <button
            className="mb-6 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            onClick={() => setModo('crear')}
          >
            + Crear Nuevo Proyecto
          </button>
          {cargando ? (
            <div className="text-gray-500">Cargando proyectos...</div>
          ) : proyectos.length === 0 ? (
            <div className="text-gray-500">No hay proyectos registrados.</div>
          ) : (
            <ul className="space-y-4">
              {proyectos.map(proy => (
                <li
                  key={proy.id}
                  className="flex items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div>
                    <span className="font-bold text-lg text-green-700">{proy.nombre}</span>
                    <p className="text-gray-600 text-sm">{proy.descripcion}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition-colors font-medium"
                      onClick={() => { setProyectoSeleccionado(proy); setModo('ver'); }}
                    >
                      Ver
                    </button>
                    <button
                      className="text-yellow-700 hover:bg-yellow-50 px-3 py-1 rounded transition-colors font-medium"
                      onClick={() => { setProyectoSeleccionado(proy); setModo('editar'); }}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors font-medium"
                      onClick={() => { setProyectoSeleccionado(proy); setModo('eliminar'); }}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {modo === 'crear' && (
        <CrearProyecto
          isOpen={true}
          onClose={() => setModo('lista')}
          onProyectoCreado={handleCreado}
        />
      )}
      {modo === 'ver' && proyectoSeleccionado && (
        <div>
          <ObtenerProyecto idProyecto={proyectoSeleccionado.id} />
          <button
            className="mt-6 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={() => setModo('lista')}
          >
            Volver
          </button>
        </div>
      )}
      {modo === 'editar' && proyectoSeleccionado && (
        <ActualizarProyecto
          idProyecto={proyectoSeleccionado.id}
          proyectoActual={proyectoSeleccionado}
          onActualizado={handleActualizado}
        />
      )}
      {modo === 'eliminar' && proyectoSeleccionado && (
        <EliminarProyecto
          idProyecto={proyectoSeleccionado.id}
          nombre={proyectoSeleccionado.nombre}
          onEliminado={handleEliminado}
        />
      )}
    </div>
  );
};

export default ListaProyectos;