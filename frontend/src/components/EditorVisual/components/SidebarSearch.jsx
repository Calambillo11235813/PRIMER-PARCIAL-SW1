import React from 'react';

/**
 * Componente de búsqueda para filtrar elementos en el sidebar
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.valor - Valor actual del campo de búsqueda
 * @param {Function} props.onChange - Función a ejecutar cuando cambia el valor
 * @param {string} props.placeholder - Texto placeholder del input
 * 
 * @example
 * <SidebarSearch 
 *   valor={consulta}
 *   onChange={establecerConsulta}
 *   placeholder="Buscar elementos UML..."
 * />
 */
const SidebarSearch = ({ valor, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 pl-10 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className="text-green-400"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        {/* Botón para limpiar búsqueda */}
        {valor && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Limpiar búsqueda"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(SidebarSearch);