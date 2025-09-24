import React from 'react';

/**
 * Componente para agrupar elementos relacionados en el sidebar
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.titulo - Título de la sección
 * @param {string} props.descripcion - Descripción opcional de la sección
 * @param {React.ReactNode} props.children - Contenido de la sección
 * @param {string} props.className - Clases CSS adicionales
 * 
 * @example
 * <SidebarSection 
 *   titulo="Elementos UML"
 *   descripcion="Arrastra elementos al lienzo para comenzar"
 * >
 *   {elementosFiltrados.map(elemento => (...))}
 * </SidebarSection>
 */
const SidebarSection = ({ titulo, descripcion, children, className = '' }) => {
  const tieneContenido = React.Children.count(children) > 0;

  return (
    <div className={`mb-6 ${className}`}>
      {/* Header de la sección */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-1">
          {titulo}
        </h2>
        {descripcion && (
          <p className="text-xs text-green-600 leading-relaxed">
            {descripcion}
          </p>
        )}
      </div>

      {/* Contenido de la sección */}
      <div className="pr-2">
        {tieneContenido ? (
          <div className="space-y-2">
            {children}
          </div>
        ) : (
          <div className="p-3 text-center text-sm text-green-600 border border-green-200 rounded-xl bg-green-50">
            No se encontraron elementos
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SidebarSection);