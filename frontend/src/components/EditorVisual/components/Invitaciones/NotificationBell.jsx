import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import websocketService from '../../../../services/websocketService';
import { invitacionService } from '../../../../services/InvitacionService';

const NotificationBell = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    // conectar websocket (si no está conectado)
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      websocketService.connect(token);
    }

    // suscribirse a mensajes
    const handler = (msg) => {
      // mensaje esperado tipo: { type: 'notificacion.invitacion', evento: 'invitacion_creada', invitacion_id, proyecto_id, correo_invitado, token? }
      try {
        if (!msg) return;
        if (msg.type === 'notificacion.invitacion' && msg.evento === 'invitacion_creada') {
          const n = {
            id: msg.invitacion_id || Date.now(),
            proyecto_id: msg.proyecto_id,
            correo: msg.correo_invitado,
            token: msg.token || null,
            creado_en: new Date().toISOString(),
          };
          setNotifs((s) => [n, ...s]);
        }
      } catch (e) {
        /* ignore */
      }
    };

    const unsubscribe = websocketService.subscribe(handler);
    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  const aceptar = async (notif) => {
    if (!notif.token) {
      alert('Token no disponible en la notificación.');
      return;
    }
    try {
      await invitacionService.aceptarInvitacion(notif.token);
      // quitar notificación aceptada
      setNotifs((s) => s.filter((n) => n.id !== notif.id));
      // opcional: mostrar toast / actualizar UI global
      alert('Invitación aceptada.');
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Error al aceptar invitación.';
      alert(detail);
    }
  };

  return (
    <div className={`relative ${className || ''}`}>
      <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-green-700 transition-colors text-white relative">
        <Bell className="w-5 h-5" />
        {notifs.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
            {notifs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 p-2">
          {notifs.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">Sin notificaciones</div>
          ) : (
            notifs.map((n) => (
              <div key={n.id} className="flex items-start justify-between p-2 border-b">
                <div>
                  <div className="text-sm font-medium">Invitación al proyecto #{n.proyecto_id}</div>
                  <div className="text-xs text-gray-500">Para: {n.correo}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => aceptar(n)} className="text-sm bg-green-600 text-white px-3 py-1 rounded">
                    Aceptar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;