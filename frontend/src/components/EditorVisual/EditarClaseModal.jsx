import React, { useState, useEffect } from 'react';

/**
 * Props:
 * - clase: objeto con { nombre, estereotipo, atributos: [], metodos: [] }
 * - onGuardar(updatedClase)
 * - onCancelar()
 */
const EditarClaseModal = ({ clase = {}, onGuardar, onCancelar }) => {
  const [nombre, setNombre] = useState('');
  const [estereotipo, setEstereotipo] = useState('');
  const [atributos, setAtributos] = useState([]);
  const [metodos, setMetodos] = useState([]);

  // Drag state para atributos
  const [draggingAttrIndex, setDraggingAttrIndex] = useState(null);
  const [dragOverAttrIndex, setDragOverAttrIndex] = useState(null);

  // Drag state para métodos
  const [draggingMethodIndex, setDraggingMethodIndex] = useState(null);
  const [dragOverMethodIndex, setDragOverMethodIndex] = useState(null);

  // Normaliza atributos/metodos: acepta strings o objetos y convierte a objetos { nombre, tipo }
  const normalizarAtributos = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((a) => {
      if (typeof a === 'string') {
        const parts = a.split(':').map((s) => s.trim());
        return { nombre: parts[0] || '', tipo: parts[1] || '' };
      }
      return { nombre: a.nombre || '', tipo: a.tipo || '' };
    });
  };

  const normalizarMetodos = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((m) => {
      if (typeof m === 'string') {
        // formato simple name(params):type o name()
        const sig = m.trim();
        const tipoMatch = sig.match(/:(.*)$/);
        const tipo = tipoMatch ? tipoMatch[1].trim() : '';
        const nameParams = tipoMatch ? sig.replace(/:(.*)$/, '').trim() : sig;
        const nameMatch = nameParams.match(/^([^\(]+)\((.*)\)$/);
        return {
          nombre: nameMatch ? nameMatch[1].trim() : nameParams,
          params: nameMatch ? nameMatch[2].trim() : '',
          tipo,
        };
      }
      return { nombre: m.nombre || '', params: m.params || '', tipo: m.tipo || '' };
    });
  };

  useEffect(() => {
    setNombre(clase?.nombre || '');
    setEstereotipo(clase?.estereotipo || '');
    setAtributos(normalizarAtributos(clase?.atributos || []));
    setMetodos(normalizarMetodos(clase?.metodos || []));
  }, [clase]);

  const actualizarAtributo = (idx, campo, valor) => {
    setAtributos((prev) => prev.map((a, i) => (i === idx ? { ...a, [campo]: valor } : a)));
  };

  const agregarAtributo = () => setAtributos((prev) => [...prev, { nombre: '', tipo: '' }]);
  const eliminarAtributo = (idx) => setAtributos((prev) => prev.filter((_, i) => i !== idx));

  const actualizarMetodo = (idx, campo, valor) =>
    setMetodos((prev) => prev.map((m, i) => (i === idx ? { ...m, [campo]: valor } : m)));

  const agregarMetodo = () => setMetodos((prev) => [...prev, { nombre: '', params: '', tipo: '' }]);
  const eliminarMetodo = (idx) => setMetodos((prev) => prev.filter((_, i) => i !== idx));

  // Handlers drag & drop atributos
  const handleAttrDragStart = (e, index) => {
    setDraggingAttrIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // necesario para Firefox
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleAttrDragOver = (e, index) => {
    e.preventDefault();
    setDragOverAttrIndex(index);
  };

  const handleAttrDrop = (e, index) => {
    e.preventDefault();
    const fromData = e.dataTransfer.getData('text/plain');
    const fromIndex = fromData ? parseInt(fromData, 10) : draggingAttrIndex;
    if (fromIndex === null || Number.isNaN(fromIndex)) return;
    const newAttrs = Array.from(atributos);
    const [moved] = newAttrs.splice(fromIndex, 1);
    const destIndex = index > fromIndex ? index : index;
    newAttrs.splice(destIndex, 0, moved);
    setAtributos(newAttrs);
    setDraggingAttrIndex(null);
    setDragOverAttrIndex(null);
  };

  const handleAttrDragEnd = () => {
    setDraggingAttrIndex(null);
    setDragOverAttrIndex(null);
  };

  // Handlers drag & drop métodos
  const handleMethodDragStart = (e, index) => {
    setDraggingMethodIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleMethodDragOver = (e, index) => {
    e.preventDefault();
    setDragOverMethodIndex(index);
  };

  const handleMethodDrop = (e, index) => {
    e.preventDefault();
    const fromData = e.dataTransfer.getData('text/plain');
    const fromIndex = fromData ? parseInt(fromData, 10) : draggingMethodIndex;
    if (fromIndex === null || Number.isNaN(fromIndex)) return;
    const newMethods = Array.from(metodos);
    const [moved] = newMethods.splice(fromIndex, 1);
    const destIndex = index > fromIndex ? index : index;
    newMethods.splice(destIndex, 0, moved);
    setMetodos(newMethods);
    setDraggingMethodIndex(null);
    setDragOverMethodIndex(null);
  };

  const handleMethodDragEnd = () => {
    setDraggingMethodIndex(null);
    setDragOverMethodIndex(null);
  };

  const handleGuardar = () => {
    const payload = {
      ...clase,
      nombre: nombre.trim(),
      estereotipo: estereotipo.trim(),
      atributos: atributos.map((a) => ({ nombre: (a.nombre || '').trim(), tipo: (a.tipo || '').trim() })),
      metodos: metodos.map((m) => ({
        nombre: (m.nombre || '').trim(),
        params: (m.params || '').trim(),
        tipo: (m.tipo || '').trim(),
      })),
    };
    if (onGuardar) onGuardar(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-[760px] max-w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Editar Clase UML</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la clase</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estereotipo</label>
            <input value={estereotipo} onChange={(e) => setEstereotipo(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Atributos</h4>
            <button onClick={agregarAtributo} className="text-sm text-green-700 px-2 py-1 rounded border">+ Atributo</button>
          </div>

          <div className="border rounded">
            <div className="grid grid-cols-12 bg-gray-50 text-sm text-gray-600 p-2">
              <div className="col-span-1" /> {/* columna para handle */}
              <div className="col-span-5 font-semibold">Nombre</div>
              <div className="col-span-4 font-semibold">Tipo</div>
              <div className="col-span-2 font-semibold text-center">Acción</div>
            </div>

            {atributos.length === 0 && <div className="p-3 text-gray-500">— sin atributos —</div>}

            {atributos.map((a, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 gap-2 items-center p-2 border-t ${dragOverAttrIndex === i ? 'bg-gray-50' : ''}`}
                onDragOver={(e) => handleAttrDragOver(e, i)}
                onDrop={(e) => handleAttrDrop(e, i)}
              >
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleAttrDragStart(e, i)}
                    onDragEnd={handleAttrDragEnd}
                    aria-label="Reordenar atributo"
                    title="Arrastrar para reordenar"
                    className={`p-1 rounded border border-transparent hover:border-gray-200 text-gray-500 cursor-grab ${
                      draggingAttrIndex === i ? 'opacity-60' : ''
                    }`}
                  >
                    {/* simple icono de arrastre */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <input
                  className="col-span-5 border rounded px-2 py-1"
                  value={a.nombre}
                  onChange={(e) => actualizarAtributo(i, 'nombre', e.target.value)}
                  placeholder="nombre"
                />
                <input
                  className="col-span-4 border rounded px-2 py-1"
                  value={a.tipo}
                  onChange={(e) => actualizarAtributo(i, 'tipo', e.target.value)}
                  placeholder="tipo (ej: String)"
                />
                <div className="col-span-2 text-center">
                  <button onClick={() => eliminarAtributo(i)} className="text-red-600 px-2 py-1 rounded border">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Métodos</h4>
            <button onClick={agregarMetodo} className="text-sm text-green-700 px-2 py-1 rounded border">+ Método</button>
          </div>

          <div className="border rounded">
            <div className="grid grid-cols-12 bg-gray-50 text-sm text-gray-600 p-2">
              <div className="col-span-1" />
              <div className="col-span-5 font-semibold">Nombre</div>
              <div className="col-span-4 font-semibold">Parámetros</div>
              <div className="col-span-2 font-semibold">Tipo</div>
              <div className="col-span-1 font-semibold text-center">Acción</div>
            </div>

            {metodos.length === 0 && <div className="p-3 text-gray-500">— sin métodos —</div>}

            {metodos.map((m, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 gap-2 items-center p-2 border-t ${dragOverMethodIndex === i ? 'bg-gray-50' : ''}`}
                onDragOver={(e) => handleMethodDragOver(e, i)}
                onDrop={(e) => handleMethodDrop(e, i)}
              >
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleMethodDragStart(e, i)}
                    onDragEnd={handleMethodDragEnd}
                    aria-label="Reordenar método"
                    title="Arrastrar para reordenar"
                    className={`p-1 rounded border border-transparent hover:border-gray-200 text-gray-500 cursor-grab ${
                      draggingMethodIndex === i ? 'opacity-60' : ''
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <input
                  className="col-span-5 border rounded px-2 py-1"
                  value={m.nombre}
                  onChange={(e) => actualizarMetodo(i, 'nombre', e.target.value)}
                  placeholder="nombre"
                />
                <input
                  className="col-span-4 border rounded px-2 py-1"
                  value={m.params}
                  onChange={(e) => actualizarMetodo(i, 'params', e.target.value)}
                  placeholder="param1:Tipo, param2:Tipo"
                />
                <input
                  className="col-span-2 border rounded px-2 py-1"
                  value={m.tipo}
                  onChange={(e) => actualizarMetodo(i, 'tipo', e.target.value)}
                  placeholder="retorno"
                />
                <div className="col-span-1 text-center">
                  <button onClick={() => eliminarMetodo(i)} className="text-red-600 px-2 py-1 rounded border">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onCancelar} className="px-4 py-2 rounded border">Cancelar</button>
          <button onClick={handleGuardar} className="px-4 py-2 rounded bg-green-600 text-white">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default EditarClaseModal;