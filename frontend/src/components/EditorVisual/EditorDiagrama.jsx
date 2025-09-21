import React, { useEffect, useRef, useState } from 'react';
import createEngine, { DiagramModel, DefaultNodeModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { ClaseNodeModel } from './custom-nodes/ClaseNodeModel.jsx';
import { ClaseNodeFactory } from './custom-nodes/ClaseNodeFactory.jsx';
import Toolbar from './Toolbar';
import EditarClaseModal from './EditarClaseModal';
import { diagramaToJSON } from './utils';
import Sidebar from './Sidebar';
import { DefaultLinkModel } from '@projectstorm/react-diagrams';

// Registra el factory de nodos personalizados
const EditorDiagrama = ({ estructuraInicial, onGuardar }) => {
  const engineRef = useRef(null);
  const [claseEditando, setClaseEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const handleDragStart = (event, tipoElemento) => {
    event.dataTransfer.setData('tipoElemento', tipoElemento);
  };

  // NUEVA FUNCIÓN PARA MANEJAR EL DROP
  const handleDrop = (event) => {
    event.preventDefault();
    const tipoElemento = event.dataTransfer.getData('tipoElemento');
    // Solo agrega si el tipo es 'Clase'
    if (tipoElemento === 'Clase') {
      const node = new ClaseNodeModel({
        nombre: 'NuevaClase',
        atributos: [],
        metodos: [],
        esAbstracta: false
      });
      // Ubica el nodo donde se soltó el mouse
      const canvasRect = event.target.getBoundingClientRect();
      const x = event.clientX - canvasRect.left;
      const y = event.clientY - canvasRect.top;
      node.setPosition(x, y);
      engineRef.current.getModel().addNode(node);
      engineRef.current.repaintCanvas();
    }
    // Puedes agregar lógica para otros tipos si lo necesitas
  };

  // Inicializa el engine y el modelo
  useEffect(() => {
    console.log('estructuraInicial recibida:', estructuraInicial);

    const engine = createEngine();
    engine.getNodeFactories().registerFactory(new ClaseNodeFactory());
    const model = new DiagramModel();

    // Si hay datos iniciales, crea los nodos personalizados
    if (estructuraInicial && estructuraInicial.clases) {
      estructuraInicial.clases.forEach((clase, idx) => {
        const node = new ClaseNodeModel({
          nombre: clase.nombre,
          atributos: clase.atributos || [],
          metodos: clase.metodos || [],
          esAbstracta: clase.esAbstracta || false
        });
        node.setPosition(100 + idx * 180, 100);
        model.addNode(node);
      });
    } else {
      // Si no hay datos, crea un nodo estándar para depuración
      const defaultNode = new DefaultNodeModel({
        name: 'Nodo estándar',
        color: 'rgb(0,192,255)'
      });
      defaultNode.setPosition(100, 100);
      model.addNode(defaultNode);
    }

    engine.setModel(model);
    engineRef.current = engine;
  }, [estructuraInicial]);

  // Agregar clase (MODIFICADO)
  const handleAgregarClase = () => {
    const node = new ClaseNodeModel({
      nombre: 'NuevaClase',
      atributos: [],
      metodos: [],
      esAbstracta: false
    });
    node.setPosition(200, 200);
    engineRef.current.getModel().addNode(node);
    engineRef.current.repaintCanvas();
  };

  // Editar clase (MODIFICADO para encontrar por nombre)
  const handleEditClase = (node) => {
    setClaseEditando(node);
    setModalAbierto(true);
  };

  // Guardar edición de clase (MODIFICADO)
  const handleGuardarClase = (claseActualizada) => {
    const model = engineRef.current.getModel();
    const node = model.getNodes().find(n => n.getOptions().nombre === claseEditando.getOptions().nombre);
    
    if (node) {
      // Actualiza las propiedades del nodo
      node.getOptions().nombre = claseActualizada.nombre;
      node.getOptions().atributos = claseActualizada.atributos;
      node.getOptions().metodos = claseActualizada.metodos;
      node.getOptions().esAbstracta = claseActualizada.esAbstracta;
      
      // Notifica al engine que el nodo ha cambiado
      node.fireEvent({}, 'entityUpdated');
      engineRef.current.repaintCanvas();
    }
    setModalAbierto(false);
    setClaseEditando(null);
  };

  // ... (resto de funciones como handleAgregarRelacion, handleGuardar, etc. se mantienen similares)

  return (
    <div className="flex">
      <Sidebar onDragStart={handleDragStart} />
      <div
        style={{ height: '500px', width: '100%', position: 'relative' }}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {engineRef.current && (
          <>
            {console.log('Renderizando CanvasWidget:', engineRef.current.getModel().getNodes())}
            <CanvasWidget engine={engineRef.current} />
          </>
        )}
      </div>
      
      {/* Modal para editar */}
      {modalAbierto && (
        <EditarClaseModal
          clase={claseEditando?.getOptions()} // Pasa las opciones del nodo
          onGuardar={handleGuardarClase}
          onCancelar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};

export default EditorDiagrama;

