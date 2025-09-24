import React, { useEffect, useRef, useMemo, useCallback } from 'react';

// Hook personalizado para detección de clics fuera del menú
const useClickOutside = (ref, isVisible, onClose) => {
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose, ref]);
};

// Hook para cálculo de posición del menú
const useMenuPosition = (x, y, menuWidth, menuHeight) => {
  return useMemo(() => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let adjustedX = Math.max(10, x);
    let adjustedY = Math.max(10, y);

    if (x + menuWidth > windowWidth) {
      adjustedX = windowWidth - menuWidth - 10;
    }

    if (y + menuHeight > windowHeight) {
      adjustedY = windowHeight - menuHeight - 10;
    }

    return { adjustedX, adjustedY };
  }, [x, y, menuWidth, menuHeight]);
};

// Componente de botón del menú reutilizable
const MenuButton = ({ 
  onClick, 
  onClose, 
  icon, 
  text, 
  variant = 'default',
  title 
}) => {
  const handleClick = useCallback(() => {
    onClick?.();
    onClose();
  }, [onClick, onClose]);

  return (
    <button
      className={`w-full text-left px-4 py-2.5 border-b border-gray-100 transition-colors ${
        variant === 'danger' 
          ? 'hover:bg-red-50 text-red-600' 
          : 'hover:bg-green-50'
      }`}
      onClick={handleClick}
      title={title}
    >
      {icon} {text}
    </button>
  );
};

const ContextMenu = ({ 
  visible, 
  x, 
  y, 
  node, 
  edge, 
  onEditarNodo, 
  onCopiarNodo, 
  onEliminarNodo, 
  onEditarRelacion, 
  onEliminarRelacion, 
  onCambiarEstiloRelacion, 
  onClose 
}) => {
  const menuRef = useRef(null);
  
  // Normalizar edge
  const edgeObj = useMemo(() => 
    edge && (typeof edge === 'string' ? { id: edge } : edge), 
    [edge]
  );

  // Debug en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && visible) {
      console.debug('[ContextMenu] visible, node:', node, 'edge:', edgeObj);
    }
  }, [visible, node, edgeObj]);

  // Configuración de dimensiones
  const menuWidth = 180;
  const menuHeight = node ? 120 : edgeObj ? 160 : 80;
  
  // Calcular posición
  const { adjustedX, adjustedY } = useMenuPosition(x, y, menuWidth, menuHeight);
  
  // Configurar detección de clics fuera
  useClickOutside(menuRef, visible, onClose);

  if (!visible) return null;

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
          <MenuButton
            icon="✏️"
            text="Editar"
            onClick={() => onEditarNodo?.(node)}
            onClose={onClose}
          />
          <MenuButton
            icon="📋"
            text="Copiar"
            onClick={() => onCopiarNodo?.(node)}
            onClose={onClose}
          />
          <MenuButton
            icon="🗑️"
            text="Eliminar"
            variant="danger"
            onClick={() => onEliminarNodo?.(node)}
            onClose={onClose}
          />
        </div>
      )}

      {/* Opciones para relaciones */}
      {edgeObj && (
        <div className="py-1">
          <MenuButton
            icon="✏️"
            text="Editar relación"
            onClick={() => onEditarRelacion?.(edgeObj)}
            onClose={onClose}
          />
          <MenuButton
            icon="🗑️"
            text="Eliminar relación"
            variant="danger"
            onClick={() => onEliminarRelacion?.(edgeObj.id)}
            onClose={onClose}
          />

          {/* Separador visual */}
          <div className="border-t border-gray-200 my-1" />

          {/* Opciones de estilo de línea */}
          <div className="px-2 py-1">
            <div className="text-xs text-gray-500 mb-1 px-2">Estilo de línea</div>
            <MenuButton
              text="Lineal"
              onClick={() => onCambiarEstiloRelacion?.(edgeObj.id, 'straight')}
              onClose={onClose}
              title="Línea recta"
            />
            <MenuButton
              text="Ortogonal"
              onClick={() => onCambiarEstiloRelacion?.(edgeObj.id, 'orthogonal')}
              onClose={onClose}
              title="Línea ortogonal (ángulos rectos)"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ContextMenu);