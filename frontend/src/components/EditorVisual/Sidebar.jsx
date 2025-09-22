import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ITEMS = [
  { id: 'clase', label: 'Clase', hint: 'Arrastrar al lienzo', bg: 'bg-green-100', border: 'border-green-200', type: 'claseNode' },
  { id: 'interface', label: 'Interface', hint: 'Arrastrar al lienzo', bg: 'bg-emerald-100', border: 'border-emerald-200', type: 'interfaceNode' },
];

const RELACIONES = [
  { id: 'asociacion', label: 'Asociación', hint: 'Arrastrar para crear relación', bg: 'bg-white', border: 'border-gray-200', type: 'relacion-asociacion' },
  { id: 'composicion', label: 'Composición', hint: 'Arrastrar para crear relación', bg: 'bg-white', border: 'border-gray-200', type: 'relacion-composicion' },
  { id: 'generalizacion', label: 'Generalización', hint: 'Arrastrar para crear relación', bg: 'bg-white', border: 'border-gray-200', type: 'relacion-generalizacion' },
];

const TRANSPARENT_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

const Sidebar = ({ onBack = null }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const dragImageRef = useRef(null);

  const items = useMemo(
    () => ITEMS.filter((it) => it.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  const relacionesFiltradas = useMemo(
    () => RELACIONES.filter((r) => r.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  const crearImagenTransparente = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 1, 1);
      canvas.style.position = 'absolute';
      canvas.style.top = '-9999px';
      canvas.style.left = '-9999px';
      document.body.appendChild(canvas);
      return canvas;
    } catch (e) {
      return null;
    }
  };

  const onDragStart = (e, item) => {
    console.debug('Sidebar onDragStart:', item);

    try {
      const img = crearImagenTransparente();
      if (img && typeof e.dataTransfer.setDragImage === 'function') {
        e.dataTransfer.setDragImage(img, 0, 0);
        dragImageRef.current = img;
      }
    } catch (err) {
      // silent fallback
    }

    try {
      e.dataTransfer.setData('application/reactflow', item.type);
      e.dataTransfer.setData('nodeType', item.type);
      e.dataTransfer.setData('text/plain', item.type);
    } catch (ex) {
      // algunos navegadores pueden lanzar si el tipo no es permitido; ignorar
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = () => {
    try {
      const img = dragImageRef.current;
      if (img && img.parentNode) img.parentNode.removeChild(img);
      dragImageRef.current = null;
    } catch (e) {
      dragImageRef.current = null;
    }
  };

  return (
    <aside
      className={`editor-sidebar transition-all duration-300 ${collapsed ? 'w-16' : 'w-72'} bg-white border-r border-green-100 shadow-lg flex flex-col h-full`}
      style={{ minHeight: '100vh' }}
    >
      {!collapsed && (
        <button
          className="sidebar-back-button"
          onClick={() => {
            if (typeof onBack === 'function') {
              try { return onBack(); } catch (e) { console.error(e); }
            }
            return navigate(-1);
          }}
          title="Volver"
        >
          Volver
        </button>
      )}

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
              placeholder="Buscar elementos o relaciones..."
              className="w-full px-4 py-2 pl-10 rounded-lg bg-green-700 placeholder-green-200 text-white border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
            <span className="absolute left-3 top-2.5 text-green-200">🔍</span>
          </div>
        )}
      </div>

      {/* Contenedor principal con scroll */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4">
        {!collapsed ? (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-2">Elementos UML</h2>
              <p className="text-xs text-green-600">Arrastra elementos al lienzo para comenzar</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, it)}
                    onDragEnd={onDragEnd}
                    title={it.hint}
                    className={`flex items-center p-3 rounded-xl cursor-grab border ${it.border} ${it.bg} hover:shadow-md transition-all duration-200`}
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

              <div className="pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Relaciones UML</h3>
                <p className="text-xs text-gray-500 mb-3">Arrastra una relación para usarla en el lienzo</p>

                <div className="space-y-2">
                  {relacionesFiltradas.map((r) => (
                    <div
                      key={r.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, r)}
                      onDragEnd={onDragEnd}
                      title={r.hint}
                      className={`flex items-center p-3 rounded-xl cursor-grab border ${r.border} ${r.bg} hover:shadow-sm transition-all duration-150`}
                    >
                      <div className="flex items-center justify-center rounded-lg bg-gray-50 w-10 h-10 shadow-inner border border-gray-200">
                        {r.id === 'asociacion' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                            <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        )}
                        {r.id === 'composicion' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                            <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            <rect x="10" y="6" width="4" height="12" fill="currentColor" />
                          </svg>
                        )}
                        {r.id === 'generalizacion' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                            <path d="M3 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            <path d="M20 12l-4-3v6l4-3z" fill="currentColor" />
                          </svg>
                        )}
                      </div>

                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{r.label}</div>
                        <div className="text-xs text-gray-500 truncate">{r.hint}</div>
                      </div>

                      <div className="text-gray-300 text-lg">↕</div>
                    </div>
                  ))}

                  {relacionesFiltradas.length === 0 && (
                    <div className="p-3 text-center text-sm text-gray-500 border border-gray-100 rounded bg-gray-50">
                      No se encontraron relaciones
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {ITEMS.map((it) => (
              <div
                key={it.id}
                draggable
                onDragStart={(e) => onDragStart(e, it)}
                onDragEnd={onDragEnd}
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

      {/* Eliminar el botón "Crear nuevo elemento" */}
    </aside>
  );
};

export default Sidebar;