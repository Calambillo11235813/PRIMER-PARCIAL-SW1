import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditorDiagrama from '../components/EditorVisual/EditorDiagrama';
import { obtenerDiagramaPorId } from '../services/diagramService';  // Cambiado: importa el servicio correcto

const EditorDiagramaPage = () => {
  const { idDiagrama } = useParams();
  const [estructura, setEstructura] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const cargar = async () => {
      try {
        if (idDiagrama) {
          // Si hay ID, carga el diagrama específico
          const resp = await obtenerDiagramaPorId(idDiagrama);
          console.log('Diagrama recibido:', resp.data);
          // Verifica si la estructura existe y tiene datos
          if (resp.data && resp.data.estructura && Object.keys(resp.data.estructura).length > 0) {
            setEstructura(resp.data.estructura);
          } else {
            setEstructura({ clases: [], relaciones: [] });
          }
        } else {
          // Si no hay ID (ruta /editor), inicia vacío
          setEstructura({ clases: [], relaciones: [] });
        }
      } catch (err) {
        console.error('Error cargando diagrama:', err);
        setError('No se pudo cargar el diagrama. Verifica el ID.');
        setEstructura({ clases: [], relaciones: [] });  // Fallback
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
        onGuardar={() => {}}
      />
    </div>
  );
};

export default EditorDiagramaPage;