// components/ModalsManager.jsx
import React from 'react';
import EditarClaseModal from '../EditarClaseModal';
import EditarRelacionModal from '../EditarRelacionModal';
import ContextMenu from '../ContextMenu';

/**
 * Gestor centralizado de todos los modales y ventanas emergentes
 * 
 * @param {Object} props
 * @param {Object} props.claseEditando - Clase en edición
 * @param {Object} props.relacionEditando - Relación en edición
 * @param {Function} props.onGuardarClase - Guardar cambios de clase
 * @param {Function} props.onGuardarRelacion - Guardar cambios de relación
 * @param {Function} props.onCancelar - Cancelar edición
 * @param {Object} props.contextMenu - Estado del menú contextual
 * @param {Object} props.contextMenuActions - Acciones del menú contextual
 * @returns {JSX.Element} Gestor de modales
 */
const ModalsManager = ({ 
  claseEditando,
  relacionEditando,
  onGuardarClase,
  onGuardarRelacion,
  onCancelar,
  contextMenu,
  contextMenuActions
}) => {
  const {
    contextMenu: menuEstado,
    closeContextMenu,
    accionesContextMenu
  } = contextMenu || {};

  return (
    <>
      {/* Modal de edición de clase */}
      {claseEditando && (
        <EditarClaseModal
          clase={claseEditando.data}
          onGuardar={onGuardarClase}
          onCancelar={onCancelar}
        />
      )}

      {/* Modal de edición de relación */}
      {relacionEditando && (
        <EditarRelacionModal
          relacion={relacionEditando}
          onGuardar={onGuardarRelacion}
          onCancelar={() => onCancelar()}
        />
      )}

      {/* Menú contextual */}
      {menuEstado && (
        <ContextMenu
          visible={menuEstado.visible}
          x={menuEstado.x}
          y={menuEstado.y}
          node={menuEstado.node}
          edge={menuEstado.edge}
          onEditarNodo={accionesContextMenu?.editarNodo}
          onEditarRelacion={accionesContextMenu?.editarRelacion}
          onCopiarNodo={accionesContextMenu?.copiarNodo}
          onEliminarNodo={accionesContextMenu?.eliminarNodoMenu}
          onEliminarRelacion={accionesContextMenu?.eliminarRelacion}
          onCambiarEstiloRelacion={accionesContextMenu?.cambiarEstiloRelacion}
          onClose={closeContextMenu}
        />
      )}
    </>
  );
};

export default ModalsManager;