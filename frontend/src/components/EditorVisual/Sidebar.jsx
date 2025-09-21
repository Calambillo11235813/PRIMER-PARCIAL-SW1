import React, { useState, useMemo } from 'react';

/**
 * Sidebar mejorado: búsqueda, collapse, tarjetas drag & drop con icono y hint.
 * Al arrastrar expone dos datos: 'application/reactflow' (compatibilidad) y 'nodeType'.
 */
const ITEMS = [
  { id: 'clase', label: 'Clase', hint: 'Arrastrar al lienzo', bg: 'bg-blue-100', type: 'claseNode' },
  { id: 'interface', label: 'Interface', hint: 'Arrastrar al lienzo', bg: 'bg-green-100', type: 'interfaceNode' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');

  const items = useMemo(
    () => ITEMS.filter((it) => it.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  const onDragStart = (e, item) => {
    e.dataTransfer.setData('application/reactflow', item.type);
    e.dataTransfer.setData('nodeType', item.type);
    e.dataTransfer.setData('text/plain', item.type); // <-- fallback compatible (Firefox/otros)
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className={`transition-all duration-200 ${collapsed ? 'w-14' : 'w-64'} bg-white/80 border rounded-md p-3 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-md bg-green-600 text-white font-semibold">U</div>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold">Elementos UML</div>
              <div className="text-xs text-gray-500">Arrastra al lienzo</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!collapsed && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="text-sm px-2 py-1 border rounded-md bg-gray-50 w-36 focus:outline-none focus:ring-1 focus:ring-green-300"
            />
          )}
          <button
            aria-label={collapsed ? 'Abrir panel' : 'Cerrar panel'}
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 rounded-md hover:bg-gray-100"
            title={collapsed ? 'Abrir' : 'Cerrar'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              {collapsed ? (
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-2 max-h-[56vh] overflow-y-auto pr-2">
          <div className="text-xs text-gray-400 px-1 mb-1">Paleta</div>

          <div className="grid gap-2">
            {items.map((it) => (
              <div
                key={it.id}
                draggable
                onDragStart={(e) => onDragStart(e, it)}
                title={it.hint}
                className="flex items-center gap-3 p-2 rounded-md border hover:shadow hover:scale-[1.01] transition transform bg-white cursor-grab"
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-md ${it.bg} border`}>
                  {/* icono simplificado */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                    <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="1.2" rx="2" />
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M8 4v6" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{it.label}</div>
                  <div className="text-xs text-gray-400 truncate">{it.hint}</div>
                </div>

                <div className="text-xs text-gray-400">⠿</div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="p-3 text-sm text-gray-500 border rounded">No se encontraron elementos</div>
            )}
          </div>

          <div className="pt-3 border-t mt-2">
            <button className="w-full text-sm px-3 py-2 rounded-md border bg-green-600 text-white hover:bg-green-700">
              + Crear elemento
            </button>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex flex-col items-center gap-2 mt-3">
          {ITEMS.map((it) => (
            <div
              key={it.id}
              draggable
              onDragStart={(e) => onDragStart(e, it)}
              className="w-10 h-10 flex items-center justify-center rounded-md bg-white border hover:shadow cursor-grab"
              title={it.label}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="1" rx="2" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;