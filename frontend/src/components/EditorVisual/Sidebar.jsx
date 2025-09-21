import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ITEMS = [
  { id: 'clase', label: 'Clase', hint: 'Arrastrar al lienzo', bg: 'bg-green-100', border: 'border-green-200', type: 'claseNode' },
  { id: 'interface', label: 'Interface', hint: 'Arrastrar al lienzo', bg: 'bg-emerald-100', border: 'border-emerald-200', type: 'interfaceNode' },
];

const Sidebar = ({ onBack = null }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const items = useMemo(
    () => ITEMS.filter((it) => it.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  const onDragStart = (e, item) => {
    e.dataTransfer.setData('application/reactflow', item.type);
    e.dataTransfer.setData('nodeType', item.type);
    e.dataTransfer.setData('text/plain', item.type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="editor-sidebar transition-all duration-300 {collapsed ? 'w-16' : 'w-72'} bg-white border-r border-green-100 shadow-lg flex flex-col h-full">
      {/* Botón "Volver" posicionado en el borde derecho del sidebar (punto rojo) */}
      {!collapsed && (
        <button
          className="sidebar-back-button"
          onClick={() => {
            // Usar la función pasada por el padre si existe (ruta explícita a diagramas)
            if (typeof onBack === 'function') {
              try { return onBack(); } catch (e) { console.error(e); }
            }
            // Si no hay onBack, fallback: volver en el historial
            return navigate(-1);
          }}
          title="Volver"
        >
          Volver
        </button>
      )}
      {/* Header */}
      <div className="p-4 bg-green-600 text-white">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold flex items-center">
              <span className="bg-white text-green-600 rounded-lg w-8 h-8 flex items-center justify-center mr-2">U</span>
              UML Editor
            </h1>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-md hover:bg-green-700 transition-colors"
            title={collapsed ? 'Expandir' : 'Contraer'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              {collapsed ? (
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>

        {!collapsed && (
          <div className="mt-4 relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar elementos..."
              className="w-full px-4 py-2 pl-10 rounded-lg bg-green-700 placeholder-green-200 text-white border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
            <span className="absolute left-3 top-2.5 text-green-200">🔍</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        {!collapsed ? (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-2">Elementos UML</h2>
              <p className="text-xs text-green-600">Arrastra elementos al lienzo para comenzar</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, it)}
                    title={it.hint}
                    className={`flex items-center p-3 rounded-xl cursor-grab border ${it.border} ${it.bg} hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5`}
                  >
                    <div className="flex items-center justify-center rounded-lg bg-white w-10 h-10 shadow-inner border border-green-200">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-green-600">
                        <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="1.2" rx="2" />
                        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M8 4v6" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="text-sm font-semibold text-green-900 truncate">{it.label}</div>
                      <div className="text-xs text-green-600 truncate">{it.hint}</div>
                    </div>

                    <div className="text-green-400 text-lg">⬌</div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="p-4 text-center text-sm text-green-600 border border-green-200 rounded-xl bg-green-50">
                    No se encontraron elementos
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-green-100">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors">
                <span>+</span>
                Crear nuevo elemento
              </button>
            </div>
          </>
        ) : (
          // Vista colapsada
          <div className="flex flex-col items-center gap-3">
            {ITEMS.map((it) => (
              <div
                key={it.id}
                draggable
                onDragStart={(e) => onDragStart(e, it)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-green-200 hover:shadow cursor-grab"
                title={it.label}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-green-600">
                  <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="1" rx="2" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 bg-green-50 border-t border-green-100">
          <div className="text-xs text-center text-green-600">
            <span className="font-medium">Herramienta UML</span> · Colaborativa
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;