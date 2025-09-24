import React from 'react';

const CustomScrollbar = ({ children, className = '', style = {} }) => (
  <div
    className={`custom-scrollbar overflow-y-auto ${className}`}
    style={style}
  >
    <style>{`
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #16a34a #f3f4f6;
      }
      .custom-scrollbar::-webkit-scrollbar { width: 10px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #16a34a; border-radius: 10px; border: 2px solid #f3f4f6; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #15803d; }
    `}</style>
    {children}
  </div>
);

export default CustomScrollbar;