import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ITEMS = [
  { id: 'clase', label: 'Clase', hint: 'Arrastrar al lienzo', bg: 'bg-green-100', border: 'border-green-200', type: 'claseNode' },
  { id: 'interface', label: 'Interface', hint: 'Arrastrar al lienzo', bg: 'bg-emerald-100', border: 'border-emerald-200', type: 'interfaceNode' },
];

// Reemplazar RELACIONES por esta versión con tipos UML claros
const RELACIONES = [
  { id: 'asociacion', label: 'Asociación', hint: 'Línea simple', bg: 'bg-white', border: 'border-gray-200', type: 'relacion-asociacion' },
  { id: 'agregacion', label: 'Agregación', hint: 'Diamante hueco (agregación)', bg: 'bg-white', border: 'border-gray-200', type: 'relacion-agregacion' },
  { id: 'composicion', label: 'Composición', hint: 'Diamante relleno (composición)', bg: 'bg-white', border: 'border-gray-200', type: 'relacion-composicion' },
  { id: 'generalizacion', label: 'Generalización', hint: 'Triángulo hueco (generalización)', bg: 'bg-white', border: 'border-gray-200', type: 'relacion-generalizacion' },
  { id: 'realizacion', label: 'Realización', hint: 'Línea punteada + triángulo hueco (realización)', bg: 'bg-white', border: 'border-gray-200', type: 'relacion-realizacion' },
  { id: 'association-class', label: 'Association Class', hint: 'Asociación con caja de clase', bg: 'bg-white', border: 'border-gray-200', type: 'relacion-association-class' },
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
      className="editor-sidebar"
      style={{
        height: '100vh',
        overflowY: 'auto',
        minWidth: 320, // antes 240, ahora más ancho
        padding: '1.5rem 1rem 4rem 1rem', // más espacio interno
      }}
    >
      <div className="bg-green-50 p-0" style={{ minWidth: 240, height: '100vh' }}>
        <style>{`
          .sidebar-scroll {
            height: 100vh;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #16a34a #f3f4f6;
          }
          .sidebar-scroll::-webkit-scrollbar { width: 8px; }
          .sidebar-scroll::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 8px; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background: #16a34a; border-radius: 8px; }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #15803d; }
        `}</style>
        <div className="sidebar-scroll p-4">
          {!collapsed ? (
            <>
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-2">Elementos UML</h2>
                <p className="text-xs text-green-600">Arrastra elementos al lienzo para comenzar</p>
              </div>

              <div className="pr-2 space-y-4">
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
                            // Línea simple
                            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
                              <line x1="1" y1="6" x2="21" y2="6" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          )}
                          {r.id === 'agregacion' && (
                            // Diamante hueco en el extremo derecho
                            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
                              <line x1="1" y1="6" x2="14" y2="6" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
                              <polygon points="14,6 17,3 20,6 17,9" fill="white" stroke="#374151" strokeWidth="1.4" />
                            </svg>
                          )}
                          {r.id === 'composicion' && (
                            // Diamante relleno en el extremo derecho
                            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
                              <line x1="1" y1="6" x2="14" y2="6" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
                              <polygon points="14,6 17,3 20,6 17,9" fill="#374151" stroke="#374151" strokeWidth="1.2" />
                            </svg>
                          )}
                          {r.id === 'generalizacion' && (
                            // Triángulo normal apuntando a la derecha (base vertical)
                            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
                              <line x1="1" y1="6" x2="14" y2="6" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
                              <polygon points="14,2 14,10 20,6" fill="white" stroke="#374151" strokeWidth="1.4" />
                            </svg>
                          )}
                          {r.id === 'realizacion' && (
                            // Línea punteada + triángulo hueco
                            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                              <line x1="1" y1="6" x2="14" y2="6" stroke="#374151" strokeWidth="1.4" strokeDasharray="3 3" strokeLinecap="round" />
                              <polygon points="14,6 20,2 20,10" fill="white" stroke="#374151" strokeWidth="1.2" />
                            </svg>
                          )}
                          {r.id === 'association-class' && (
                            // Línea con pequeña caja de clase en el centro/derecha
                            <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                              <line x1="1" y1="8" x2="10" y2="8" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
                              <rect x="10" y="2" width="8" height="8" fill="white" stroke="#374151" strokeWidth="1.2" />
                              <line x1="18" y1="8" x2="27" y2="8" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
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
      </div>
    </aside>
  );
};

export default Sidebar;