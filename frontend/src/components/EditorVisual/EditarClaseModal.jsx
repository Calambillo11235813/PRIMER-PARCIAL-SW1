import React, { useState, useEffect, useCallback } from 'react';

// Hook personalizado para drag & drop
const useDragAndDrop = (items, setItems) => {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = useCallback((e, index) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e, index) => {
    e.preventDefault();
    const fromData = e.dataTransfer.getData('text/plain');
    const fromIndex = fromData ? parseInt(fromData, 10) : draggingIndex;
    
    if (fromIndex === null || fromIndex === index || Number.isNaN(fromIndex)) return;
    
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(index, 0, movedItem);
    setItems(newItems);
    
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, [items, setItems, draggingIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, []);

  return {
    draggingIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
};

// Icono de arrastre reutilizable
const DragIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Componente de tabla reutilizable
const AttributeMethodTable = ({ 
  title, 
  items, 
  onAdd, 
  onUpdate, 
  onDelete,
  fields,
  addButtonText,
  emptyMessage 
}) => {
  const dragState = useDragAndDrop(items, onUpdate);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-700">{title}</h4>
        <button 
          onClick={onAdd}
          className="text-sm text-green-700 hover:text-green-800 px-3 py-1 rounded border border-green-300 hover:border-green-400 transition-colors"
        >
          + {addButtonText}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header de la tabla */}
        <div className="grid grid-cols-12 bg-green-50 text-sm text-green-800 p-3 border-b border-green-100">
          <div className="col-span-1 text-center font-semibold"></div>
          {fields.map(field => (
            <div key={field.key} className={`font-semibold ${field.headerClass}`}>
              {field.label}
            </div>
          ))}
          <div className="col-span-1 text-center font-semibold">Acción</div>
        </div>

        {/* Mensaje cuando está vacío */}
        {items.length === 0 && (
          <div className="p-4 text-gray-400 text-center bg-white">{emptyMessage}</div>
        )}

        {/* Filas de items */}
        {items.map((item, index) => (
          <div
            key={index}
            className={`grid grid-cols-12 gap-2 items-center p-3 border-b border-gray-100 last:border-b-0 ${
              dragState.dragOverIndex === index ? 'bg-green-50' : 'bg-white'
            } ${dragState.draggingIndex === index ? 'opacity-50' : ''}`}
            onDragOver={(e) => dragState.handleDragOver(e, index)}
            onDrop={(e) => dragState.handleDrop(e, index)}
          >
            {/* Handle de arrastre */}
            <div className="col-span-1 flex justify-center">
              <button
                draggable
                onDragStart={(e) => dragState.handleDragStart(e, index)}
                onDragEnd={dragState.handleDragEnd}
                className="p-1 rounded border border-transparent hover:border-green-200 text-gray-500 cursor-grab transition-colors"
                title="Arrastrar para reordenar"
              >
                <DragIcon />
              </button>
            </div>

            {/* Campos de entrada */}
            {fields.map(field => (
              <input
                key={field.key}
                className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${
                  field.inputClass || ''
                }`}
                value={item[field.key] || ''}
                onChange={(e) => onUpdate(index, field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            ))}

            {/* Botón eliminar */}
            <div className="col-span-1 flex justify-center">
              <button 
                onClick={() => onDelete(index)}
                className="text-red-600 hover:text-red-800 px-2 py-1 rounded border border-transparent hover:border-red-200 transition-colors"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EditarClaseModal = ({ clase = {}, onGuardar, onCancelar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    estereotipo: '',
    atributos: [],
    metodos: []
  });

  // Normalización de datos
  const normalizarAtributos = useCallback((arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(a => typeof a === 'string' 
      ? { nombre: a.split(':')[0]?.trim() || '', tipo: a.split(':')[1]?.trim() || '' }
      : { nombre: a.nombre || '', tipo: a.tipo || '' }
    );
  }, []);

  const normalizarMetodos = useCallback((arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(m => {
      if (typeof m === 'string') {
        const tipoMatch = m.match(/:(.*)$/);
        const tipo = tipoMatch ? tipoMatch[1].trim() : '';
        const nameParams = tipoMatch ? m.replace(/:(.*)$/, '').trim() : m;
        const nameMatch = nameParams.match(/^([^\(]+)\((.*)\)$/);
        return {
          nombre: nameMatch ? nameMatch[1].trim() : nameParams,
          params: nameMatch ? nameMatch[2].trim() : '',
          tipo
        };
      }
      return { nombre: m.nombre || '', params: m.params || '', tipo: m.tipo || '' };
    });
  }, []);

  // Inicialización
  useEffect(() => {
    setFormData({
      nombre: clase?.nombre || '',
      estereotipo: clase?.estereotipo || '',
      atributos: normalizarAtributos(clase?.atributos || []),
      metodos: normalizarMetodos(clase?.metodos || [])
    });
  }, [clase, normalizarAtributos, normalizarMetodos]);

  // Handlers genéricos
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }));
  };

  const addArrayItem = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template]
    }));
  };

  const deleteArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleGuardar = () => {
    const payload = {
      ...clase,
      nombre: formData.nombre.trim(),
      estereotipo: formData.estereotipo.trim(),
      atributos: formData.atributos.map(a => ({
        nombre: a.nombre.trim(),
        tipo: a.tipo.trim()
      })),
      metodos: formData.metodos.map(m => ({
        nombre: m.nombre.trim(),
        params: m.params.trim(),
        tipo: m.tipo.trim()
      }))
    };
    console.log('Payload al guardar clase:', payload);
    onGuardar?.(payload);
    console.log('onGuardar ejecutado');
  };

  // Configuración de campos para las tablas
  const atributoFields = [
    { 
      key: 'nombre', 
      label: 'Nombre', 
      placeholder: 'nombre',
      headerClass: 'col-span-5',
      inputClass: 'col-span-5'
    },
    { 
      key: 'tipo', 
      label: 'Tipo', 
      placeholder: 'tipo (ej: String)',
      headerClass: 'col-span-4',
      inputClass: 'col-span-4'
    }
  ];

  const metodoFields = [
    { 
      key: 'nombre', 
      label: 'Nombre', 
      placeholder: 'nombre',
      headerClass: 'col-span-4',
      inputClass: 'col-span-4'
    },
    { 
      key: 'params', 
      label: 'Parámetros', 
      placeholder: 'param1:Tipo, param2:Tipo',
      headerClass: 'col-span-4',
      inputClass: 'col-span-4'
    },
    { 
      key: 'tipo', 
      label: 'Tipo Retorno', 
      placeholder: 'retorno',
      headerClass: 'col-span-2',
      inputClass: 'col-span-2'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-t-xl">
          <h3 className="text-xl font-semibold">✏️ Editar Clase UML</h3>
          <p className="text-green-100 text-sm mt-1">Modifique los detalles de la clase</p>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Campos principales */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la clase</label>
              <input 
                value={formData.nombre} 
                onChange={(e) => updateField('nombre', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Ej: Usuario, Producto..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estereotipo</label>
              <input 
                value={formData.estereotipo} 
                onChange={(e) => updateField('estereotipo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Ej: «Entity», «Service»..."
              />
            </div>
          </div>

          {/* Tabla de atributos */}
          <AttributeMethodTable
            title="Atributos"
            items={formData.atributos}
            onAdd={() => addArrayItem('atributos', { nombre: '', tipo: '' })}
            onUpdate={(index, key, value) => updateArrayField('atributos', index, key, value)}
            onDelete={(index) => deleteArrayItem('atributos', index)}
            fields={atributoFields}
            addButtonText="Atributo"
            emptyMessage="— sin atributos —"
          />

          {/* Tabla de métodos */}
          <AttributeMethodTable
            title="Métodos"
            items={formData.metodos}
            onAdd={() => addArrayItem('metodos', { nombre: '', params: '', tipo: '' })}
            onUpdate={(index, key, value) => updateArrayField('metodos', index, key, value)}
            onDelete={(index) => deleteArrayItem('metodos', index)}
            fields={metodoFields}
            addButtonText="Método"
            emptyMessage="— sin métodos —"
          />

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              onClick={onCancelar}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleGuardar}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              💾 Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditarClaseModal);