import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { invitacionService } from '../../../../services/InvitacionService';
import websocketService from '../../../../services/websocketService';

const AceptarInvitacionPage = () => {
  const [search] = useSearchParams();
  const token = search.get('token') || '';
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return setMensaje('Token no proporcionado.');
    (async () => {
      setLoading(true);
      try {
        const resp = await invitacionService.aceptarInvitacion(token);
        setMensaje('Invitación aceptada. Redirigiendo al proyecto...');
        // emitir notificación WS opcional para otros clientes
        try {
          websocketService.send({ type: 'invitacion_aceptada', payload: resp.data || {} });
        } catch (e) { /* ignore */ }
        setTimeout(() => navigate('/proyectos'), 1200);
      } catch (err) {
        setMensaje(err?.response?.data?.detail || 'Error al aceptar invitación.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  return (
    <div className="p-6">
      <h2>Aceptar invitación</h2>
      {loading ? <p>Procesando...</p> : <p>{mensaje}</p>}
    </div>
  );
};

export default AceptarInvitacionPage;