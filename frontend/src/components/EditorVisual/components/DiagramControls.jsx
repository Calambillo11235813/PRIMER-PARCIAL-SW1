// components/DiagramControls.jsx
import React from 'react';

/**
 * Barra de controles adicionales para el editor (undo/redo/guardar)
 * 
 * @param {Object} props
 * @param {Function} props.onUndo - Acción deshacer
 * @param {Function} props.onRedo - Acción rehacer
 * @param {Function} props.onGuardar - Acción guardar
 * @param {boolean} props.puedeDeshacer - Si hay acciones para deshacer
 * @param {boolean} props.puedeRehacer - Si hay acciones para rehacer
 * @param {boolean} props.guardando - Si está guardando
 * @returns {JSX.Element} Controles del editor
 */
const DiagramControls = ({ 
  onUndo, 
  onRedo, 
  onGuardar, 
  puedeDeshacer, 
  puedeRehacer, 
  guardando 
}) => {
  return (
    <div className="diagram-controls absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2">
      <button
        onClick={onUndo}
        disabled={!puedeDeshacer}
        className={`p-2 rounded-md transition-colors ${
          puedeDeshacer 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
        title="Deshacer (Ctrl+Z)"
      >
        ⎌
      </button>
      
      <button
        onClick={onRedo}
        disabled={!puedeRehacer}
        className={`p-2 rounded-md transition-colors ${
          puedeRehacer 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
        title="Rehacer (Ctrl+Y)"
      >
        ↻
      </button>
      
      <button
        onClick={onGuardar}
        disabled={guardando}
        className={`p-2 rounded-md transition-colors ${
          guardando 
            ? 'bg-blue-400 text-white cursor-wait' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
        title="Guardar diagrama"
      >
        {guardando ? '⏳' : '💾'}
      </button>
    </div>
  );
};

export default DiagramControls;