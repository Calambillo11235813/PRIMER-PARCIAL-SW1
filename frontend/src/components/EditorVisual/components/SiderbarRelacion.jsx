import React from 'react';

// Importar los componentes de íconos UML
import AsociacionSidebar from './UMLSymbols/AsociacionSidebar';
import AgregacionSidebar from './UMLSymbols/AgregacionSidebar';
import ComposicionSidebar from './UMLSymbols/ComposicionsSidebar';
import HerenciaSidebar from './UMLSymbols/HereneciaSidebar';
import RealizacionSidebar from './UMLSymbols/RealizacionSidebar';
import AssociationClassSidebar from './UMLSymbols/AssociationClassSidebar';

const iconosRelacion = {
  asociacion: <AsociacionSidebar />,
  agregacion: <AgregacionSidebar />,
  composicion: <ComposicionSidebar />,
  herencia: <HerenciaSidebar />,
  realizacion: <RealizacionSidebar />,
  associationClass: <AssociationClassSidebar />,
};

/**
 * Componente para una relación UML arrastrable del sidebar
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.relacion - Datos de la relación a mostrar
 * @param {Function} props.onDragStart - Maneja inicio de arrastre
 * @param {Function} props.onDragEnd - Maneja fin de arrastre
 */
const SidebarRelacion = ({ relacion, onDragStart, onDragEnd }) => (
  <div
    className="flex items-center bg-green-100 border border-green-600 rounded-lg px-3 py-2 mb-3 cursor-grab shadow-sm transition hover:bg-green-200"
    draggable
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    title={relacion.descripcion}
  >
    <div className="flex items-center justify-center rounded-lg bg-gray-50 w-10 h-10 shadow-inner border border-gray-200">
      {iconosRelacion[relacion.id] || <AsociacionSidebar />}
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

export default React.memo(SidebarRelacion);
