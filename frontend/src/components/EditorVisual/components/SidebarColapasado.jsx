import React from 'react';

/**
 * Componente para mostrar el sidebar en modo colapsado
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.elementos - Lista de elementos a mostrar
 * @param {Function} props.onDragStart - Maneja inicio de arrastre
 * @param {Function} props.onDragEnd - Maneja fin de arrastre
 * 
 * @example
 * <SidebarColapsado 
 *   elementos={ELEMENTOS_UML}
 *   onDragStart={manejarInicioArrastre}
 *   onDragEnd={manejarFinArrastre}
 * />
 */
const SidebarColapsado = ({ elementos, onDragStart, onDragEnd }) => {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-green-50 h-screen">
      {elementos.map((elemento) => (
        <div
          key={elemento.id}
          draggable
          onDragStart={(e) => onDragStart(e, elemento)}
          onDragEnd={onDragEnd}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-green-200 hover:shadow cursor-grab transition-shadow"
          title={elemento.label}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-green-600">
            <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="1" rx="2" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default React.memo(SidebarColapsado);