import React from 'react';

/**
 * Componente para una relación UML arrastrable del sidebar
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.relacion - Datos de la relación a mostrar
 * @param {Function} props.onDragStart - Maneja inicio de arrastre
 * @param {Function} props.onDragEnd - Maneja fin de arrastre
 */
const SidebarRelacion = ({ relacion, onDragStart, onDragEnd }) => {
  const renderizarIconoRelacion = () => {
    const iconos = {
      asociacion: (
        <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
          <line x1="1" y1="6" x2="21" y2="6" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
      agregacion: (
        <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
          <line x1="1" y1="6" x2="14" y2="6" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
          <polygon points="14,6 17,3 20,6 17,9" fill="white" stroke="#374151" strokeWidth="1.4" />
        </svg>
      ),
      // ... otros iconos
    };

    return iconos[relacion.id] || iconos.asociacion;
  };

  return (
    <div
      className="flex items-center bg-green-100 border border-green-600 rounded-lg px-3 py-2 mb-3 cursor-grab shadow-sm transition hover:bg-green-200"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title={relacion.descripcion}
    >
      <div className="flex items-center justify-center rounded-lg bg-gray-50 w-10 h-10 shadow-inner border border-gray-200">
        {renderizarIconoRelacion()}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">
          {relacion.label}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {relacion.hint}
        </div>
      </div>

      <div className="text-gray-300 text-lg">↕</div>
    </div>
  );
};

export default React.memo(SidebarRelacion);