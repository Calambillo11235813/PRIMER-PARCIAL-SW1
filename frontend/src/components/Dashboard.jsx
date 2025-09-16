import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  FileText, 
  Clock, 
  Star, 
  TrendingUp, 
  Zap,
  ChevronRight,
  Calendar,
  Code,
  GitBranch,
  Bell
} from 'lucide-react';
import { obtenerUsuarioPorId } from '../services/usuarioService.js';  // Importa la función

const Dashboard = ({ user, onIrPerfil }) => {
  const [usuarioCompleto, setUsuarioCompleto] = useState(user);  // Estado para datos completos
  const [cargandoUsuario, setCargandoUsuario] = useState(false);

  // Cargar datos completos del usuario al montar
  useEffect(() => {
    const cargarUsuarioCompleto = async () => {
      console.log('Usuario recibido en Dashboard:', user);  // Log 1: Verificar user
      if (user && user.id) {
        console.log('ID del usuario:', user.id);  // Log 2: Verificar ID
        setCargandoUsuario(true);
        try {
          const respuesta = await obtenerUsuarioPorId(user.id);
          console.log('Respuesta de obtenerUsuarioPorId:', respuesta);  // Log 3: Verificar respuesta completa
          console.log('Datos del usuario:', respuesta.data);  // Log 4: Verificar datos
          setUsuarioCompleto(respuesta.data);  // Actualiza con datos completos
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
        } finally {
          setCargandoUsuario(false);
        }
      } else {
        console.log('Usuario no tiene ID o no existe:', user);  // Log 5: Si no hay ID
      }
    };
    cargarUsuarioCompleto();
  }, [user]);

  const [proyectosRecientes, setProyectosRecientes] = useState([
    {
      id: 1,
      nombre: "E-commerce Navideño",
      descripcion: "Sistema de ventas para temporada navideña",
      ultimaActividad: "hace 2 horas",
      colaboradores: 3,
      progreso: 75,
      tipo: "Web App",
      destacado: true
    },
    {
      id: 2,
      nombre: "API Restaurante",
      descripcion: "Sistema de pedidos online",
      ultimaActividad: "hace 1 día",
      colaboradores: 2,
      progreso: 45,
      tipo: "API REST",
      destacado: false
    },
    {
      id: 3,
      nombre: "Sistema Biblioteca",
      descripcion: "Gestión de préstamos y usuarios",
      ultimaActividad: "hace 3 días",
      colaboradores: 1,
      progreso: 90,
      tipo: "Web App",
      destacado: false
    }
  ]);

  const [estadisticas, setEstadisticas] = useState({
    totalProyectos: 8,
    proyectosActivos: 3,
    colaboraciones: 5,
    codigoGenerado: 12
  });

  const [actividades, setActividades] = useState([
    {
      id: 1,
      tipo: "colaboracion",
      mensaje: "María se unió al proyecto E-commerce Navideño",
      tiempo: "hace 1 hora",
      icono: Users,
      color: "text-blue-600"
    },
    {
      id: 2,
      tipo: "codigo",
      mensaje: "Código Spring Boot generado para API Restaurante",
      tiempo: "hace 3 horas",
      icono: Code,
      color: "text-green-600"
    },
    {
      id: 3,
      tipo: "proyecto",
      mensaje: "Nuevo diagrama creado en Sistema Biblioteca",
      tiempo: "hace 5 horas",
      icono: FileText,
      color: "text-purple-600"
    }
  ]);

  const QuickActionCard = ({ icon: Icon, title, description, action, color = "green" }) => (
    <div 
      onClick={action}
      className={`bg-white rounded-xl shadow-lg p-6 border border-${color}-200 hover:border-${color}-300 cursor-pointer transition-all duration-200 hover:shadow-xl group`}
    >
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-${color}-200 transition-colors`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <h3 className={`font-bold text-${color}-800 mb-2`}>{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex items-center text-sm text-green-600 font-medium group-hover:translate-x-1 transition-transform">
        Comenzar <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, trend, color = "green" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value}</p>
          {trend && (
            <p className="text-green-600 text-sm mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ProyectoCard = ({ proyecto }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <h3 className="font-bold text-green-800 text-lg">{proyecto.nombre}</h3>
          {proyecto.destacado && (
            <Star className="w-5 h-5 text-yellow-500 ml-2 fill-current" />
          )}
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
          {proyecto.tipo}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{proyecto.descripcion}</p>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm font-medium text-green-600">{proyecto.progreso}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${proyecto.progreso}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {proyecto.colaboradores} colaboradores
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {proyecto.ultimaActividad}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Abrir Editor
        </button>
        <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
          Compartir
        </button>
      </div>
    </div>
  );

  const ActividadItem = ({ actividad }) => {
    const Icon = actividad.icono;
    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-green-50 rounded-lg transition-colors">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${actividad.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">{actividad.mensaje}</p>
          <p className="text-xs text-gray-500 mt-1">{actividad.tiempo}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header de bienvenida */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido de vuelta, {cargandoUsuario ? 'Cargando...' : `${usuarioCompleto.nombre || 'Sin nombre'} ${usuarioCompleto.apellido || 'Sin apellido'}`}! 🎉
            </h1>
            <p className="text-green-100 text-lg">
              Listo para crear diagramas UML increíbles en el mes cruceño
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FileText} 
          label="Proyectos Totales" 
          value={estadisticas.totalProyectos} 
          trend="+2 este mes"
        />
        <StatCard 
          icon={Zap} 
          label="Proyectos Activos" 
          value={estadisticas.proyectosActivos}
          color="blue"
        />
        <StatCard 
          icon={Users} 
          label="Colaboraciones" 
          value={estadisticas.colaboraciones}
          color="purple"
        />
        <StatCard 
          icon={Code} 
          label="Código Generado" 
          value={estadisticas.codigoGenerado}
          color="orange"
        />
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-2xl font-bold text-green-800 mb-6">🚀 Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            icon={Plus}
            title="Nuevo Proyecto"
            description="Crear un diagrama UML desde cero"
            action={() => console.log('Crear proyecto')}
          />
          <QuickActionCard
            icon={FileText}
            title="Plantillas"
            description="Comenzar con plantillas predefinidas"
            action={() => console.log('Ver plantillas')}
            color="blue"
          />
          <QuickActionCard
            icon={Users}
            title="Colaborar"
            description="Unirse a un proyecto existente"
            action={() => console.log('Colaborar')}
            color="purple"
          />
          <QuickActionCard
            icon={GitBranch}
            title="Asistente IA"
            description="Optimizar diagramas con IA"
            action={() => console.log('IA')}
            color="orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Proyectos recientes */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-800">📌 Proyectos Recientes</h2>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-6">
            {proyectosRecientes.map(proyecto => (
              <ProyectoCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>
        </div>

        {/* Panel lateral con actividades */}
        <div className="space-y-6">
          {/* Actividad reciente */}
          <div className="bg-white rounded-xl shadow-lg border border-green-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-green-800 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Actividad Reciente
                </h3>
              </div>
            </div>
            <div className="p-3">
              {actividades.map(actividad => (
                <ActividadItem key={actividad.id} actividad={actividad} />
              ))}
            </div>
          </div>

          {/* Tips y consejos */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-6">
            <h3 className="font-bold text-green-800 mb-4 flex items-center">
              💡 Tip Cruceño del Día
            </h3>
            <p className="text-green-700 text-sm leading-relaxed">
              ¿Sabías que puedes usar el asistente IA para generar automáticamente las relaciones entre tus clases UML? ¡Ideal para proyectos navideños!
            </p>
            <button className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium">
              Más consejos →
            </button>
          </div>

          {/* Acceso rápido al perfil */}
          <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
            <h3 className="font-bold text-green-800 mb-4">👤 Tu Perfil</h3>
            <p className="text-gray-600 text-sm mb-4">
              Personaliza tu experiencia y ajusta tus preferencias
            </p>
            <button
              onClick={onIrPerfil}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Ir a mi Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;