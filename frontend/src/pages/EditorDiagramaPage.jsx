import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditorDiagrama from '../components/EditorVisual/EditorDiagrama';
import { obtenerDiagramaPorId } from '../services/diagramService';  // Cambiado: importa el servicio correcto

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
    <div className="min-h-screen bg-green-50">
      <button
        className="m-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        onClick={() => navigate('/diagramas')}
      >
        Volver
      </button>
      <EditorDiagrama
        estructuraInicial={estructura}
        projectId={projectId}
        diagramaId={diagramaId}
        onGuardar={(respuestaBackend) => {
          // cuando se crea por primera vez, el backend devuelve el id: fijarlo en el padre
          if (respuestaBackend && respuestaBackend.id) {
            setDiagramaId(respuestaBackend.id);
          }
          // si el backend devuelve la estructura actualizada, sincronizarla
          if (respuestaBackend && respuestaBackend.estructura) {
            setEstructura(respuestaBackend.estructura);
          }
        }}
      />
    </div>
  );
};

export default EditorDiagramaPage;