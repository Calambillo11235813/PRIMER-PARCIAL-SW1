import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  PenTool, 
  User, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  ChevronDown,
  Settings,
  HelpCircle
} from 'lucide-react';

const Navbar = ({ usuario, onLogout, onIrPerfil }) => {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [perfilMenuAbierto, setPerfilMenuAbierto] = useState(false);
  const location = useLocation();

  const navegacionItems = [
    {
      nombre: 'Dashboard',
      ruta: '/',
      icono: Home,
      activo: location.pathname === '/'
    },
    {
      nombre: 'Proyectos',
      ruta: '/proyectos',
      icono: FolderOpen,
      activo: location.pathname === '/proyectos'
    },
    {
      nombre: 'Editor UML',
      ruta: '/editor',
      icono: PenTool,
      activo: location.pathname === '/editor'
    }
  ];

  const NavItem = ({ item, esMobile = false }) => (
    <Link
      to={item.ruta}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
        ${item.activo 
          ? 'bg-green-700 text-white shadow-lg' 
          : 'text-green-100 hover:bg-green-700 hover:text-white'
        }
        ${esMobile ? 'w-full justify-start' : ''}
      `}
      onClick={() => esMobile && setMenuMovilAbierto(false)}
    >
      <item.icono className="w-5 h-5" />
      <span className="font-medium">{item.nombre}</span>
    </Link>
  );

  const PerfilDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setPerfilMenuAbierto(!perfilMenuAbierto)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-white"
      >
        <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium">
            {usuario?.nombre || usuario?.first_name || 'Usuario'}
          </p>
          <p className="text-xs text-green-200">
            {usuario?.correo_electronico || usuario?.email}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${perfilMenuAbierto ? 'rotate-180' : ''}`} />
      </button>

      {perfilMenuAbierto && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {usuario?.nombre || usuario?.first_name || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">
              {usuario?.correo_electronico || usuario?.email}
            </p>
          </div>
          
          <button
            onClick={() => {
              onIrPerfil();
              setPerfilMenuAbierto(false);
            }}
            className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
          >
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Mi Perfil</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Configuración</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
            <HelpCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Ayuda</span>
          </button>
          
          <div className="border-t border-gray-200 mt-2 pt-2">
            <button
              onClick={() => {
                onLogout();
                setPerfilMenuAbierto(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav className="bg-gradient-to-r from-green-600 to-green-700 shadow-xl border-b border-green-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-green-600 font-bold text-xl">🎄</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-white">UML Colaborativo</h1>
                  <p className="text-xs text-green-200">Diseño cruceño</p>
                </div>
              </Link>
            </div>

            {/* Navegación principal - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {navegacionItems.map((item) => (
                <NavItem key={item.ruta} item={item} />
              ))}
            </div>

            {/* Herramientas de la derecha - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Buscador */}
              <div className="relative">
                <Search className="w-4 h-4 text-green-300 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  className="bg-green-800 text-white placeholder-green-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:bg-green-700 transition-colors w-48"
                />
              </div>

              {/* Notificaciones */}
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-green-700 transition-colors text-white relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    3
                  </span>
                </button>
              </div>

              {/* Perfil dropdown */}
              <PerfilDropdown />
            </div>

            {/* Botón menú móvil */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                className="p-2 rounded-lg hover:bg-green-700 transition-colors text-white"
              >
                {menuMovilAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {menuMovilAbierto && (
          <div className="md:hidden bg-green-800 border-t border-green-500">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navegacionItems.map((item) => (
                <NavItem key={item.ruta} item={item} esMobile />
              ))}
              
              <div className="border-t border-green-600 pt-4 mt-4">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {usuario?.nombre || usuario?.first_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-green-200">
                      {usuario?.correo_electronico || usuario?.email}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    onIrPerfil();
                    setMenuMovilAbierto(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-green-100"
                >
                  <User className="w-5 h-5" />
                  <span>Mi Perfil</span>
                </button>
                
                <button
                  onClick={() => {
                    onLogout();
                    setMenuMovilAbierto(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-green-100"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Overlay para cerrar menús */}
      {(menuMovilAbierto || perfilMenuAbierto) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => {
            setMenuMovilAbierto(false);
            setPerfilMenuAbierto(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;