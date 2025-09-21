import React, { useState } from 'react';

const EditarClaseModal = ({ clase, onGuardar, onCancelar }) => {
  const [nombre, setNombre] = useState(clase?.nombre || '');
  const [atributos, setAtributos] = useState(clase?.atributos?.join('\n') || '');
  const [metodos, setMetodos] = useState(clase?.metodos?.join('\n') || '');
  const [esAbstracta, setEsAbstracta] = useState(clase?.esAbstracta || false);

  const handleGuardar = () => {
    const atributosArray = atributos
      .split('\n')
      .map(attr => attr.trim())
      .filter(attr => attr.length > 0);
    
    const metodosArray = metodos
      .split('\n')
      .map(method => method.trim())
      .filter(method => method.length > 0);
    
    onGuardar({ 
      ...clase, 
      nombre, 
      atributos: atributosArray, 
      metodos: metodosArray, 
      esAbstracta 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Editar Clase UML</h2>
        
        {/* Campo: Nombre de la clase */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Nombre de la clase
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Persona, CuentaBancaria"
            required
          />
        </div>

        {/* Campo: Atributos */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Atributos (uno por línea)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Ej: -nombre:String, +edad:int, #saldo:double
          </p>
          <textarea
            value={atributos}
            onChange={e => setAtributos(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="-nombre: String&#10;+edad: int&#10;#saldo: double"
          />
        </div>

        {/* Campo: Métodos */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Métodos (uno por línea)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Ej: +getNombre():String, -calcularEdad():int
          </p>
          <textarea
            value={metodos}
            onChange={e => setMetodos(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="+getNombre(): String&#10;-calcularEdad(): int&#10;#validarSaldo(): boolean"
          />
        </div>

        {/* Campo: Clase Abstracta */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={esAbstracta}
              onChange={e => setEsAbstracta(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Clase Abstracta
            </span>
          </label>
          <p className="text-xs text-gray-500 ml-6 mt-1">
            El nombre de la clase se mostrará en itálicas
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end">
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={handleGuardar}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarClaseModal;