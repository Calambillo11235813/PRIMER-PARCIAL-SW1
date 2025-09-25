import React from 'react';
import ClaseIcon from './UMLSymbols/ClaseIcon';
import InterfaceIcon from './UMLSymbols/InterfaceIcon';
// Agrega más íconos si tienes otros tipos

const iconosElemento = {
  clase: <ClaseIcon />,
  interface: <InterfaceIcon />,
  // Otros tipos si los tienes
};

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
const SidebarItem = ({ elemento, onDragStart, onDragEnd }) => (
  <div
    className={`flex items-center bg-green-100 border border-green-600 rounded-lg px-3 py-2 mb-3 cursor-grab shadow-sm transition hover:bg-green-200`}
    draggable
    onDragStart={(e) => onDragStart(e, elemento)} // ← CORREGIDO: pasa el elemento
    onDragEnd={onDragEnd}
    title={elemento.hint}
  >
    <div className="flex items-center justify-center rounded-lg bg-gray-50 w-10 h-10 shadow-inner border border-gray-200">
      {iconosElemento[elemento.tipo] || <ClaseIcon />}
    </div>
    <div className="ml-3 flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-800 truncate">
        {elemento.label}
      </div>
      <div className="text-xs text-gray-500 truncate">
        {elemento.hint}
      </div>
    </div>
    <div className="text-green-300 text-lg">⬌</div>
  </div>
);

export default React.memo(SidebarItem);