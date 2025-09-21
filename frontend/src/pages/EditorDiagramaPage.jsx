import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditorDiagrama from '../components/EditorVisual/EditorDiagrama';
import { obtenerDiagramaPorId } from '../services/diagramService';  // Cambiado: importa el servicio correcto
import Sidebar from '../components/EditorVisual/Sidebar'; // Asegúrate de que la ruta sea correcta

const EditorDiagramaPage = () => {
  const { idDiagrama } = useParams();
  const [estructura, setEstructura] = React.useState(null);
  const [diagramaId, setDiagramaId] = React.useState(null);
  const [projectId, setProjectId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const cargar = async () => {
      try {
        if (idDiagrama) {
          const resp = await obtenerDiagramaPorId(idDiagrama);
          console.log('Diagrama recibido:', resp.data);
          // guardar estructura y projectId por separado
          if (resp.data && resp.data.estructura && Object.keys(resp.data.estructura).length > 0) {
            setEstructura(resp.data.estructura);
          } else {
            setEstructura({ clases: [], relaciones: [] });
          }
          setProjectId(resp.data.proyecto || resp.data.proyecto_id || null);
          setDiagramaId(resp.data.id || null);
        } else {
          setEstructura({ clases: [], relaciones: [] });
        }
      } catch (err) {
        console.error('Error cargando diagrama:', err);
        setError('No se pudo cargar el diagrama. Verifica el ID.');
        setEstructura({ clases: [], relaciones: [] });
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [idDiagrama]);

  if (loading) return <div className="p-8">Cargando diagrama...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="bg-green-50" style={{ minHeight: '100vh', position: 'relative', width: '100vw', padding: 0, margin: 0 }}>
      {/* Quitamos botón Volver aquí; Sidebar lo maneja */}
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* Sidebar se renderiza normalmente; pasamos onBack apuntando a la lista de diagramas del proyecto */}
        <Sidebar onBack={() => {
          if (projectId) {
            // ruta explícita a la lista de diagramas del proyecto
            navigate(`/proyectos/${projectId}/diagramas`);
          } else {
            // fallback: volver en el historial
            navigate(-1);
          }
        }} />
        <div style={{ flex: 1, minHeight: '100vh' }}>
          <EditorDiagrama
            estructuraInicial={estructura}
            projectId={projectId}
            diagramaId={diagramaId}
            onGuardar={(respuestaBackend) => {
              if (respuestaBackend && respuestaBackend.id) setDiagramaId(respuestaBackend.id);
              if (respuestaBackend && respuestaBackend.estructura) setEstructura(respuestaBackend.estructura);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorDiagramaPage;