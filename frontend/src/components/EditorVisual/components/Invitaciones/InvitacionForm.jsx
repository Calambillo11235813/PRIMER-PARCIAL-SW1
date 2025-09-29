import React, { useState } from 'react';
import { proyectoService } from '../../../../services/proyectoService';
import websocketService from '../../../../services/websocketService';

const InvitacionForm = ({ projectId, onSuccess, setNotificacion }) => {
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('colaborador');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e && e.preventDefault();
    const emailNorm = (correo || '').trim().toLowerCase();
    if (!emailNorm) {
      setNotificacion && setNotificacion({ tipo: 'error', mensaje: 'Correo requerido' });
      return;
    }
    setLoading(true);
    try {
      const resp = await proyectoService.invitar(projectId, { correo_electronico: emailNorm, rol });
      // si backend devuelve token, copiar link de aceptación
      const token = resp?.data?.token;
      if (token) {
        const acceptUrl = `${window.location.origin}/aceptar-invitacion?token=${encodeURIComponent(token)}`;
        try { await navigator.clipboard.writeText(acceptUrl); }
        catch (err) { /* ignore */ }
        setNotificacion && setNotificacion({ tipo: 'success', mensaje: 'Invitación enviada. Link copiado al portapapeles.' });
      } else {
        setNotificacion && setNotificacion({ tipo: 'success', mensaje: 'Invitación enviada.' });
      }
      setCorreo('');
      setRol('colaborador');
      onSuccess && onSuccess();
      // emitir evento WS para otros clientes
      try {
        websocketService.send({
          type: 'invitacion_creada',
          payload: { proyecto_id: projectId, correo_electronico: emailNorm, estado: resp.data?.estado || 'pendiente' }
        });
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Error invitando:', err);
      console.error('Error response data:', err?.response?.data);
      const msg = err?.response?.data;
      // preferir detail o listar errores de campos
      const texto = (msg?.detail) || (typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
      setNotificacion && setNotificacion({ tipo: 'error', mensaje: texto || 'Error al invitar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-2">
      <div className="mb-2">
        <label className="block text-sm">Correo</label>
        <input value={correo} onChange={e => setCorreo(e.target.value)} className="w-full input" placeholder="correo@ejemplo.com" />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Rol</label>
        <select value={rol} onChange={e => setRol(e.target.value)} className="w-full select">
          <option value="colaborador">Colaborador</option>
          <option value="anfitrion">Anfitrión</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Enviando...' : 'Invitar'}
      </button>
    </form>
  );
};

export default InvitacionForm;