// ClaseNode.jsx (Versión Estilo Enterprise)
import React from 'react';

const ClaseNode = ({ clase = {}, onEdit, isAbstract = false }) => {
  // Función para formatear atributos con visibilidad
  const formatearAtributo = (attr) => {
    // Asume que el atributo puede venir como "-nombre: string" o solo "nombre"
    // Si no tiene visibilidad, se asume privado por defecto (-)
    if (!attr.includes(':')) {
      return `- ${attr}: type`;
    }
    return attr;
  };

  // Función similar para métodos
  const formatearMetodo = (method) => {
    // Asume que el método puede venir como "+getNombre(): string" o solo "getNombre"
    if (!method.includes('(')) {
      return `+ ${method}(): void`;
    }
    return method;
  };

  return (
    <div className="bg-white border border-gray-800 rounded-sm cursor-pointer min-w-[180px] font-mono text-xs shadow-sm"> 
      {/* Compartimento del Nombre */}
      <div 
        className="font-bold text-center py-1 border-b border-gray-800 bg-gray-50"
        onClick={() => onEdit(clase)} // Permite editar al hacer clic en el nombre
      >
        {isAbstract ? <i>{clase.nombre || 'Clase'}</i> : (clase.nombre || 'Clase')}
      </div>
      
      {/* Compartimento de Atributos */}
      {clase.atributos && clase.atributos.length > 0 && (
        <div className="py-1 border-b border-gray-300">
          <ul className="ml-2">
            {clase.atributos.map((attr, idx) => (
              <li key={idx}>{formatearAtributo(attr)}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Compartimento de Métodos */}
      {clase.metodos && clase.metodos.length > 0 && (
        <div className="py-1">
          <ul className="ml-2">
            {clase.metodos.map((method, idx) => (
              <li key={idx}>{formatearMetodo(method)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClaseNode;