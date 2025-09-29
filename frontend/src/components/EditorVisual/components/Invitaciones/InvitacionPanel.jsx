import React from 'react';
import InvitacionForm from './InvitacionForm';

const InvPanel = ({ projectId, setNotificacion }) => {
  return (
    <div className="invitacion-panel border-l p-2 w-80 bg-white">
      <h3 className="font-semibold mb-2">Invitaciones</h3>
      <InvitacionForm
        projectId={projectId}
        onSuccess={() => {}}
        setNotificacion={setNotificacion}
      />
    </div>
  );
};

export default InvPanel;