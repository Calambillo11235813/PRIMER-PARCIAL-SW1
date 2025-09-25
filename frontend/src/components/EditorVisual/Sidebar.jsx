import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Components
import SidebarItem from './components/SidebarItem';
import SidebarRelacion from './components/SiderbarRelacion';
import SidebarSearch from './components/SidebarSearch';
import SidebarSection from './components/SidebarSection';
import SidebarColapsado from './components/SidebarColapasado';

// Hooks
import { useSidebarDrag } from './hooks/useSidebarDrag'; // ← Hook específico para Sidebar

// Constants
import { ELEMENTOS_UML, RELACIONES_UML } from './constants/sidebarItems';

/**
 * Barra lateral del editor UML con elementos arrastrables
 * Utiliza useSidebarDrag para manejar la creación de nuevos elementos en el lienzo
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onBack - Callback para navegación hacia atrás
 * 
 * @example
 * <Sidebar onBack={() => navigate('/dashboard')} />
 */
const Sidebar = ({ onBack = null }) => {
  const [colapsado, establecerColapsado] = useState(false);
  const [consulta, establecerConsulta] = useState('');
  const navegar = useNavigate();
  
  // Usar el hook específico para sidebar
  const { manejarInicioArrastre, manejarFinArrastre } = useSidebarDrag();

  const elementosFiltrados = useMemo(() => 
    ELEMENTOS_UML.filter(item => 
      item.label.toLowerCase().includes(consulta.trim().toLowerCase())
    ), 
    [consulta]
  );

  const relacionesFiltradas = useMemo(() => 
    RELACIONES_UML.filter(relacion => 
      relacion.label.toLowerCase().includes(consulta.trim().toLowerCase())
    ), 
    [consulta]
  );

  if (colapsado) {
    return (
      <SidebarColapsado 
        elementos={ELEMENTOS_UML}
        onDragStart={manejarInicioArrastre}
        onDragEnd={manejarFinArrastre}
      />
    );
  }

  return (
    <aside className="editor-sidebar h-screen overflow-y-auto min-w-80 p-6 bg-green-50">
      <div className="sidebar-scroll">
        <SidebarSearch 
          valor={consulta}
          onChange={establecerConsulta}
          placeholder="Buscar elementos UML..."
        />

        <SidebarSection 
          titulo="Elementos UML"
          descripcion="Arrastra elementos al lienzo para comenzar"
        >
          {elementosFiltrados.map(elemento => (
            <SidebarItem
              key={elemento.id}
              elemento={elemento}
              onDragStart={manejarInicioArrastre}
              onDragEnd={manejarFinArrastre}
            />
          ))}
        </SidebarSection>

        <SidebarSection 
          titulo="Relaciones UML"
          descripcion="Arrastra una relación para usarla en el lienzo"
        >
          {relacionesFiltradas.map(relacion => (
            <SidebarRelacion
              key={relacion.id}
              relacion={relacion}
              onDragStart={manejarInicioArrastre}
              onDragEnd={manejarFinArrastre}
            />
          ))}
        </SidebarSection>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);