import React, { useEffect, useState, useCallback } from 'react';
import InvitacionForm from './InvitacionForm';
import { proyectoService } from '../../../../services/proyectoService';
import websocketService from '../../../../services/websocketService';

const InvPanel = ({ projectId, setNotificacion }) => {
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const resp = await proyectoService.obtenerInvitaciones(projectId);
      setInvitaciones(resp.data || []);
    } catch (err) {
      console.error('Error cargando invitaciones', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    // Suscribirse a WS para eventos de invitaciones
    const handler = (msg) => {
      try {
        if (!msg || !msg.type) return;
        if (msg.type === 'invitacion_creada') {
          const p = msg.payload || {};
          if (Number(p.proyecto_id) === Number(projectId)) {
            // refrescar lista de invitaciones o insertar optimista
            cargar();
          }
        } else if (msg.type === 'invitacion_aceptada') {
          const p = msg.payload || {};
          if (Number(p.proyecto_id) === Number(projectId)) {
            cargar();
            setNotificacion && setNotificacion({ tipo: 'info', mensaje: `Invitación aceptada por ${p.correo_electronico || 'un usuario'}` });
          }
        }
      } catch (e) { console.error('inv panel ws handler', e); }
    };
    const unsub = websocketService.subscribe(handler);
    return () => unsub();
  }, [projectId, cargar, setNotificacion]);

  return (
    <div className="invitacion-panel border-l p-2 w-80 bg-white">
      <h3 className="font-semibold mb-2">Invitaciones</h3>
      <InvitacionForm projectId={projectId} onSuccess={cargar} setNotificacion={setNotificacion} />
      <div className="mt-4">
        {loading ? <div>Cargando invitaciones...</div> : (
          <ul>
            {invitaciones.length === 0 && <li className="text-sm text-gray-500">No hay invitaciones</li>}
            {invitaciones.map(inv => (
              <li key={inv.id} className="py-1 text-sm border-b">
                <div className="flex justify-between">
                  <span>{inv.correo_electronico}</span>
                  <span className="text-xs text-gray-500">{inv.estado}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InvPanel;