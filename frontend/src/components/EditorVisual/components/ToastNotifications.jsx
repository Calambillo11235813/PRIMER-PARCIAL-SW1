// components/ToastNotifications.jsx
import React, { useEffect } from 'react';

/**
 * Componente para mostrar notificaciones toast temporales
 * 
 * @param {Object} props
 * @param {Object} props.notificacion - Datos de la notificación
 * @param {Function} props.onCerrar - Callback para cerrar notificación
 * @returns {JSX.Element} Notificación toast
 */
const ToastNotifications = ({ notificacion, onCerrar }) => {
  // Cerrar automáticamente después de 4 segundos
  useEffect(() => {
    if (notificacion) {
      const timer = setTimeout(() => {
        onCerrar();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notificacion, onCerrar]);

  if (!notificacion) return null;

  const estilosBase = 
    'fixed top-20 right-4 px-6 py-3 rounded-lg shadow-xl z-50 ' +
    'transform transition-all duration-300 ease-in-out ' +
    'max-w-md animate-fade-in-up';

  const estilosPorTipo = {
    exito: 'bg-green-500 text-white border-l-4 border-green-600',
    error: 'bg-red-500 text-white border-l-4 border-red-600',
    info: 'bg-blue-500 text-white border-l-4 border-blue-600',
    advertencia: 'bg-yellow-500 text-white border-l-4 border-yellow-600'
  };

  const estilosCombinados = `${estilosBase} ${estilosPorTipo[notificacion.tipo] || estilosPorTipo.info}`;

  return (
    <div className={estilosCombinados}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{notificacion.mensaje}</span>
        <button
          onClick={onCerrar}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ToastNotifications;