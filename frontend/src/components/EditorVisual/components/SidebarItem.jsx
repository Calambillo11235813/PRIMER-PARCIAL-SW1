import React from 'react';

/**
 * Componente para un elemento arrastrable del sidebar
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.elemento - Datos del elemento a mostrar
 * @param {Function} props.onDragStart - Maneja inicio de arrastre
 * @param {Function} props.onDragEnd - Maneja fin de arrastre
 * 
 * @example
 * <SidebarItem 
 *   elemento={item} 
 *   onDragStart={manejarInicioArrastre}
 *   onDragEnd={manejarFinArrastre}
 * />
 */
const SidebarItem = ({ elemento, onDragStart, onDragEnd }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, elemento)}
      onDragEnd={onDragEnd}
      title={elemento.hint}
      className={`flex items-center p-3 rounded-xl cursor-grab border ${elemento.border} ${elemento.bg} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-center rounded-lg bg-white w-10 h-10 shadow-inner border border-green-200">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-green-600">
          <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="1.2" rx="2" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 4v6" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="text-sm font-semibold text-green-900 truncate">
          {elemento.label}
        </div>
        <div className="text-xs text-green-600 truncate">
          {elemento.hint}
        </div>
      </div>

      <div className="text-green-400 text-lg">⬌</div>
    </div>
  );
};

export default React.memo(SidebarItem);