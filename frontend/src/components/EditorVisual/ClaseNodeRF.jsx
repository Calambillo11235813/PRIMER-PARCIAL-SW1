import React from 'react';
import { Handle, Position } from '@xyflow/react';
import ClaseNode from './ClaseNode';  // Asegúrate de que ClaseNode.jsx existe y no tiene errores

const ClaseNodeRF = ({ data }) => {
  return (
    <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px', background: 'white' }}>
      <Handle type="target" position={Position.Top} />
      <ClaseNode clase={data} onEdit={() => {}} isAbstract={data.esAbstracta} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ClaseNodeRF;