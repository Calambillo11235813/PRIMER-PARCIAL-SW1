import React, { useState, useEffect, useCallback } from 'react';
import InvertirRelacion from './components/InvertirRelacion';
import { getHandleValidoInvertido } from './utils/getHandleValido'; // ← Usa la función correcta
import { TIPOS_RELACION } from './constants/umlTypes'; // Usa la constante global

const MULTIPLICIDADES = ['1', 'N', '0..1', '1..*', '0..*', '*'];

const TIPOS_RELACION_LABELS = {
  [TIPOS_RELACION.ASOCIACION]: 'Asociación —',
  [TIPOS_RELACION.COMPOSICION]: 'Composición ● (Todo-Parte fuerte)',
  [TIPOS_RELACION.AGREGACION]: 'Agregación ◇ (Todo-Parte débil)',
  [TIPOS_RELACION.HERENCIA]: 'Herencia △ (Generalización)',
  [TIPOS_RELACION.REALIZACION]: 'Realización ⟲ (Interface)',
  [TIPOS_RELACION.DEPENDENCIA]: 'Dependencia ⤴ (Uso temporal)',
  [TIPOS_RELACION.ASSOCIATION_CLASS]: 'Clase de Asociación ⧉'
};

// Componente de select reutilizable
const SelectUML = ({ label, value, onChange, options, optionLabels = {}, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select 
      value={value}
      onChange={onChange}
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
    >
      {options.map(opcion => (
        <option key={opcion} value={opcion}>
          {optionLabels[opcion] || opcion}
        </option>
      ))}
    </select>
  </div>
);

// Preview visual de la relación
const PreviewRelacion = ({ tipo, multiplicidadSource, multiplicidadTarget }) => {
  const getIconoTipo = (tipo) => {
    const iconos = {
      [TIPOS_RELACION.COMPOSICION]: '●',
      [TIPOS_RELACION.AGREGACION]: '◇',
      [TIPOS_RELACION.HERENCIA]: '△',
      [TIPOS_RELACION.REALIZACION]: '⟲',
      [TIPOS_RELACION.DEPENDENCIA]: '⤴',
      [TIPOS_RELACION.ASOCIACION]: '—'
    };
    return iconos[tipo] || '—';
  };

  const getColorTipo = (tipo) => {
    const colores = {
      [TIPOS_RELACION.COMPOSICION]: 'text-red-600',
      [TIPOS_RELACION.AGREGACION]: 'text-blue-600',
      [TIPOS_RELACION.HERENCIA]: 'text-green-600',
      [TIPOS_RELACION.REALIZACION]: 'text-purple-600',
      [TIPOS_RELACION.DEPENDENCIA]: 'text-orange-600',
      [TIPOS_RELACION.ASOCIACION]: 'text-gray-600'
    };
    return colores[tipo] || 'text-gray-600';
  };

  return (
    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
      <div className="text-xs text-green-600 font-medium mb-2">Vista Previa de la Relación:</div>
      <div className="flex items-center justify-center text-sm font-mono space-x-3">
        <span className="bg-white px-3 py-1 rounded border border-gray-300 shadow-sm">
          {multiplicidadSource}
        </span>
        <span className={`text-lg font-bold ${getColorTipo(tipo)}`}>
          {getIconoTipo(tipo)}
        </span>
        <span className="bg-white px-3 py-1 rounded border border-gray-300 shadow-sm">
          {multiplicidadTarget}
        </span>
      </div>
      <div className="text-xs text-gray-500 text-center mt-2">
        {TIPOS_RELACION_LABELS[tipo]}
      </div>
    </div>
  );
};

const EditarRelacionModal = ({ relacion, onGuardar, onCancelar, nodos }) => {
  const [formData, setFormData] = useState({
    tipo: TIPOS_RELACION.ASOCIACION,
    multiplicidadSource: '1',
    multiplicidadTarget: 'N'
  });

  // Inicializar con datos de la relación
  useEffect(() => {
    if (relacion) {
      console.log('[EditarRelacionModal] Inicializando con relación:', relacion);
      setFormData({
        tipo: relacion.data?.tipo || TIPOS_RELACION.ASOCIACION,
        multiplicidadSource: relacion.data?.multiplicidadSource || '1',
        multiplicidadTarget: relacion.data?.multiplicidadTarget || 'N'
      });
    }
  }, [relacion]);

  // Handlers con useCallback para optimización
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleGuardar = useCallback(() => {
    let nuevaRelacion = {
      ...relacion,
      data: {
        ...relacion.data,
        ...formData
      },
    };

    // Si el tipo es association_class, agrega la clase intermedia
    if (formData.tipo === TIPOS_RELACION.ASSOCIATION_CLASS) {
      // Aquí deberías obtener los datos de la clase intermedia desde el formulario o selección
      // Ejemplo temporal:
      nuevaRelacion.data.claseAsociacion = {
        id: 'claseAsociacion-' + Date.now(),
        nombre: 'ClaseIntermedia',
        atributos: [],
        metodos: []
      };
      console.log('[EditarRelacionModal] Asignando clase intermedia:', nuevaRelacion.data.claseAsociacion);
    }

    console.log('[EditarRelacionModal] Guardando relación:', nuevaRelacion);
    onGuardar?.(nuevaRelacion);
  }, [relacion, formData, onGuardar]);

  // MODIFICADO: Usa getHandleValidoInvertido para asegurar handles válidos
  const handleInvertirRelacion = useCallback(() => {
    if (!relacion) return;

    const nuevoSourceHandle = getHandleValidoInvertido(
      relacion.target,
      relacion.targetHandle,
      'source'
    );
    const nuevoTargetHandle = getHandleValidoInvertido(
      relacion.source,
      relacion.sourceHandle,
      'target'
    );

    const nuevaRelacion = {
      ...relacion,
      source: relacion.target,
      target: relacion.source,
      sourceHandle: nuevoSourceHandle,
      targetHandle: nuevoTargetHandle,
      data: {
        ...relacion.data,
        multiplicidadSource: formData.multiplicidadTarget,
        multiplicidadTarget: formData.multiplicidadSource,
      }
    };

    setFormData(prev => ({
      ...prev,
      multiplicidadSource: nuevaRelacion.data.multiplicidadSource,
      multiplicidadTarget: nuevaRelacion.data.multiplicidadTarget
    }));
    onGuardar?.(nuevaRelacion);
  }, [relacion, formData, onGuardar]);

  // Manejar Enter para guardar
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleGuardar();
    }
  }, [handleGuardar]);

  // Efecto para manejar teclado
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-96 max-w-md mx-4">
        {/* Header con tema verde */}
        <div className="bg-green-600 text-white p-6 rounded-t-xl">
          <h2 className="text-xl font-bold flex items-center">
            🔗 Editar Relación UML
          </h2>
          <p className="text-green-100 text-sm mt-1">
            Configure los detalles de la relación entre clases
          </p>
        </div>

        <div className="p-6">
          {/* Vista previa */}
          <PreviewRelacion 
            tipo={formData.tipo}
            multiplicidadSource={formData.multiplicidadSource}
            multiplicidadTarget={formData.multiplicidadTarget}
          />

          {/* Botón para invertir la dirección */}
          <div className="flex justify-center mb-4">
            <InvertirRelacion onInvertir={handleInvertirRelacion} />
          </div>

          {/* Tipo de Relación */}
          <SelectUML
            label="Tipo de Relación"
            value={formData.tipo}
            onChange={(e) => updateField('tipo', e.target.value)}
            options={Object.values(TIPOS_RELACION)}
            optionLabels={TIPOS_RELACION_LABELS}
          />

          {/* Multiplicidades */}
          <div className="grid grid-cols-2 gap-4">
            <SelectUML
              label="Multiplicidad Origen"
              value={formData.multiplicidadSource}
              onChange={(e) => updateField('multiplicidadSource', e.target.value)}
              options={MULTIPLICIDADES}
              className="mb-0"
            />
            <SelectUML
              label="Multiplicidad Destino"
              value={formData.multiplicidadTarget}
              onChange={(e) => updateField('multiplicidadTarget', e.target.value)}
              options={MULTIPLICIDADES}
              className="mb-0"
            />
          </div>

          {/* Información de multiplicidades */}
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <strong>Multiplicidades comunes:</strong> 1 (uno), N (muchos), 0..1 (opcional), 
            1..* (uno o más), 0..* (cero o más), * (muchos)
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onCancelar}
              className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              💾 Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditarRelacionModal);