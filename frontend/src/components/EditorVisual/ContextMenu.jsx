import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ visible, x, y, node, edge, onEditarNodo, onCopiarNodo, onEliminarNodo, onEditarRelacion, onEliminarRelacion, onClose }) => {
  const menuRef = useRef(null);

  // Solo un efecto para manejar el cierre

  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Agregar event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  // Calcular posición ajustada - VERSIÓN SIMPLIFICADA Y FUNCIONAL
  const menuWidth = 180;
  const menuHeight = node ? 120 : 80;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Ajustar para que no se salga de la pantalla
  let adjustedX = x;
  let adjustedY = y;

  if (x + menuWidth > windowWidth) {
    adjustedX = windowWidth - menuWidth - 10;
  }

  if (y + menuHeight > windowHeight) {
    adjustedY = windowHeight - menuHeight - 10;
  }

  // Asegurar que no sea negativo
  adjustedX = Math.max(10, adjustedX);
  adjustedY = Math.max(10, adjustedY);

  return (
    <div
      ref={menuRef}
      className="context-menu bg-white border border-gray-300 rounded-lg shadow-xl z-[9999] text-sm"
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        minWidth: `${menuWidth}px`,
      }}
    >
      {/* Opciones para nodos */}
      {node && (
        <div className="py-1">
          <button
            className="w-full text-left px-4 py-2.5 hover:bg-green-50 border-b border-gray-100 transition-colors"
            onClick={() => {
              onEditarNodo(node);
              onClose();
            }}
          >
            ✏️ Editar
          </button>
          <button
            className="w-full text-left px-4 py-2.5 hover:bg-green-50 border-b border-gray-100 transition-colors"
            onClick={() => {
              onCopiarNodo(node);
              onClose();
            }}
          >
            📋 Copiar
          </button>
          <button
            className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
            onClick={() => {
              onEliminarNodo(node);
              onClose();
            }}
          >
            🗑️ Eliminar
          </button>
        </div>
      )}

      {/* Opciones para relaciones */}
      {edge && (
        <div className="py-1">
          <button
            className="w-full text-left px-4 py-2.5 hover:bg-green-50 border-b border-gray-100 transition-colors"
            onClick={() => {
              onEditarRelacion(edge);
              onClose();
            }}
          >
            ✏️ Editar relación
          </button>
          <button
            className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
            onClick={() => {
              onEliminarRelacion(edge.id);
              onClose();
            }}
          >
            🗑️ Eliminar relación
          </button>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;