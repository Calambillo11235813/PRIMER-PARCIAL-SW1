import React from 'react';
import ClaseNode from '../ClaseNode';

const ClaseNodeWidget = ({ node, engine }) => {
  console.log('DEBUG ClaseNodeWidget: Renderizando widget funcional para nodo:', node.getOptions().nombre);

  return (
    <div
      style={{
        position: 'absolute',
        left: node.getPosition().x,
        top: node.getPosition().y,
        background: 'white',
        border: '1px solid black',
        borderRadius: '5px',
        padding: '10px',
        cursor: 'pointer',
        zIndex: 10
      }}
      onClick={() => {
        console.log('DEBUG ClaseNodeWidget: Clic en nodo');
        node.fireEvent({}, 'onEdit');
      }}
    >
      <ClaseNode
        clase={node.getOptions()}
        onEdit={() => node.fireEvent({}, 'onEdit')}
        isAbstract={node.getOptions().esAbstracta}
      />
    </div>
  );
};

export default ClaseNodeWidget;