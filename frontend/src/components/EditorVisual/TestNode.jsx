import React from 'react';

const TestNode = ({ data }) => (
  <div
    style={{
      background: '#ffe4b5',
      border: '3px dashed #d2691e',
      borderRadius: '16px',
      color: '#222',
      fontWeight: 'bold',
      fontSize: '1.2rem',
      padding: '24px',
      minWidth: '180px',
      textAlign: 'center',
      boxShadow: '0 0 12px #d2691e55'
    }}
  >
    Nodo de Prueba
    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
      {data?.label || 'Sin etiqueta'}
    </div>
  </div>
);

export default TestNode;