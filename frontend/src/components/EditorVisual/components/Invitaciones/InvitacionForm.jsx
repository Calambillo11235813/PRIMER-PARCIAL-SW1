import React, { useState } from 'react';
import { invitacionService } from '../../../../services/InvitacionService';
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
      const resp = await invitacionService.invitar(projectId, { correo_electronico: emailNorm, rol });
      const token = resp?.token;
      if (token) {
        const acceptUrl = `${window.location.origin}/aceptar-invitacion?token=${encodeURIComponent(token)}`;
        try { await navigator.clipboard.writeText(acceptUrl); } catch (err) { /* ignore */ }
        setNotificacion && setNotificacion({ tipo: 'success', mensaje: 'Invitación enviada. Link copiado al portapapeles.' });
      } else {
        setNotificacion && setNotificacion({ tipo: 'success', mensaje: 'Invitación enviada.' });
      }
      setCorreo('');
      setRol('colaborador');
      onSuccess && onSuccess();

      try {
        websocketService.send({
          type: 'invitacion_creada',
          payload: {
            proyecto_id: projectId,
            correo_electronico: emailNorm,
            estado: resp?.estado || 'pendiente',
            invitacion_id: resp?.id,
            token: resp?.token,
          },
        });
      } catch (e) { /* ignore */ }
    } catch (err) {
      // Mostrar y registrar el payload de error devuelto por el servidor
      console.error('Error invitando (raw):', err);
      const payload = err.payload ?? (err.response && err.response.data) ?? null;
      console.error('Error invitando (payload):', payload);
      let mensaje;
      if (!payload) {
        mensaje = err.message || 'Error al invitar';
      } else if (typeof payload === 'string') {
        mensaje = payload;
      } else if (payload.detail) {
        mensaje = payload.detail;
      } else if (payload.correo_electronico) {
        // si el backend devuelve errores por campo
        mensaje = Array.isArray(payload.correo_electronico) ? payload.correo_electronico.join(' ') : String(payload.correo_electronico);
      } else {
        mensaje = JSON.stringify(payload);
      }
      setNotificacion && setNotificacion({ tipo: 'error', mensaje });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-2">
      <div className="mb-2">
        <label className="block text-sm">Correo</label>
        <input
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          className="w-full input"
          placeholder="correo@ejemplo.com"
        />
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