import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ visible, x, y, node, edge, onEditarNodo, onCopiarNodo, onEliminarNodo, onEditarRelacion, onEliminarRelacion, onCambiarEstiloRelacion, onClose }) => {
  const menuRef = useRef(null);


   // DEBUG: log inmediato cada render para verificar que el componente se monta y recibe props
   console.debug && console.debug('[ContextMenu] render props ->', { visible, x, y, node, edge, hasOnCambiarEstiloRelacion: !!onCambiarEstiloRelacion });
  // Normalizar edge: puede llegar como objeto o como id (string)
  const edgeObj = edge && (typeof edge === 'string' ? { id: edge } : edge);

  // DEBUG: comprobar props que recibe el menú
  useEffect(() => {
    if (visible) {
      try {
        console.debug('[ContextMenu] visible, node:', node, 'edgeObj:', JSON.parse(JSON.stringify(edgeObj)));
      } catch (err) {
        console.debug('[ContextMenu] visible, node:', node, 'edgeObj (non-serializable):', edgeObj);
      }
    }
  }, [visible, node, edgeObj]);

  // Solo un efecto para manejar el cierre
  useEffect(() => {
    if (!visible) return;

    // Delay adding outside click listener so the opening click does not immediately trigger it.
    let timer = null;
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

    timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 50);

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
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
      {edgeObj && (
        <div className="py-1">
          <button
            className="w-full text-left px-4 py-2.5 hover:bg-green-50 border-b border-gray-100 transition-colors"
            onClick={() => {
              if (onEditarRelacion) onEditarRelacion(edgeObj);
              onClose();
            }}
          >
            ✏️ Editar relación
          </button>
          <button
            className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
            onClick={() => {
              if (onEliminarRelacion) onEliminarRelacion(edgeObj.id);
              onClose();
            }}
          >
            🗑️ Eliminar relación
          </button>

          {/* separador */}
          <div className="menu-separator" />

          {/* NUEVO: opción para cambiar estilo/layout de la relación */}
          <div className="menu-group px-2 py-1">
            <div className="text-xs text-gray-500 mb-1">Estilo de línea</div>
            <button
              onClick={() => {
                if (onCambiarEstiloRelacion) onCambiarEstiloRelacion(edgeObj.id, 'straight');
                onClose();
              }}
              className="menu-item w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors"
              title="Línea recta"
            >
              Estilo: Lineal
            </button>
            <button
              onClick={() => {
                if (onCambiarEstiloRelacion) onCambiarEstiloRelacion(edgeObj.id, 'orthogonal');
                onClose();
              }}
              className="menu-item w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors"
              title="Línea ortogonal (ángulos rectos)"
            >
              Estilo: Ortogonal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;