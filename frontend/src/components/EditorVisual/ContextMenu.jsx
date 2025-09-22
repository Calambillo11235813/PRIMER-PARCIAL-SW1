import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ visible, x, y, node, edge, onEditarNodo, onCopiarNodo, onEliminarNodo, onEliminarRelacion, onClose }) => {
  const menuRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [visible, onClose]);

  // Cerrar menú con Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [visible, onClose]);

  if (!visible) return null;

  // Ajustar posición si el menú se sale de la pantalla
  const menuWidth = 160;
  const menuHeight = node ? 120 : 40; // Altura según si es nodo o relación
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let adjustedX = x;
  let adjustedY = y;

  // Ajustar horizontalmente
  if (x + menuWidth > windowWidth) {
    adjustedX = x - menuWidth;
  } else {
    adjustedX = x + 5; // Pequeño margen a la derecha
  }

  // Ajustar verticalmente
  if (y + menuHeight > windowHeight) {
    adjustedY = windowHeight - menuHeight - 5;
  }

  return (
    <div
      ref={menuRef}
      className="context-menu bg-white border border-gray-200 rounded-md shadow-lg z-50 text-sm"
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        minWidth: '160px',
      }}
    >
      {/* Opciones para nodos */}
      {node && (
        <div className="py-1">
          <button
            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => {
              onEditarNodo(node);
              onClose();
            }}
          >
            ✏️ Editar
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => {
              onCopiarNodo(node);
              onClose();
            }}
          >
            📋 Copiar
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
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
            className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
            onClick={() => {
              console.log('DEBUG: Eliminando relación:', edge);
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