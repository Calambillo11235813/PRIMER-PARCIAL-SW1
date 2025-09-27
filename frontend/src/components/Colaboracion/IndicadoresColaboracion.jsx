import React from 'react';

const IndicadoresColaboracion = ({ usuariosConectados, estaConectado }) => {
    return (
        <div className="fixed top-20 right-4 z-50 space-y-2">
            {/* Indicador de estado de conexión */}
            <div className={`px-3 py-2 rounded-lg shadow-md ${
                estaConectado ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
            }`}>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                        estaConectado ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                        {estaConectado ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>
            </div>

            {/* Lista de usuarios conectados */}
            {usuariosConectados.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 max-w-xs">
                    <h4 className="font-semibold text-green-800 mb-2 text-sm">
                        👥 Colaboradores ({usuariosConectados.length})
                    </h4>
                    <div className="space-y-1">
                        {usuariosConectados.map(usuario => (
                            <div key={usuario.id} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-gray-700 truncate">
                                    {usuario.nombre}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IndicadoresColaboracion;