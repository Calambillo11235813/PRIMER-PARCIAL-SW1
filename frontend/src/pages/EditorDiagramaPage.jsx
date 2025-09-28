import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import EditorDiagrama from '../components/EditorVisual/EditorDiagrama';
import { obtenerDiagramaPorId } from '../services/diagramService';
import Sidebar from '../components/EditorVisual/Sidebar';

const EditorDiagramaPage = () => {
  const { idDiagrama } = useParams();
  const [estructura, setEstructura] = useState(null);
  const [diagramaId, setDiagramaId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Carga del diagrama
  useEffect(() => {
    const cargarDiagrama = async () => {
      try {
        if (idDiagrama) {
          const resp = await obtenerDiagramaPorId(idDiagrama);
          console.log('Diagrama recibido:', resp.data);
          setEstructura(resp.data.estructura || { clases: [], relaciones: [] });
          setProjectId(resp.data.proyecto || resp.data.proyecto_id || null);
          setDiagramaId(resp.data.id || null);
        } else {
          setEstructura({ clases: [], relaciones: [] });
        }
      } catch (err) {
        console.error('Error cargando diagrama:', err);
        setError('No se pudo cargar el diagrama.');
        setEstructura({ clases: [], relaciones: [] });
      } finally {
        setLoading(false);
      }
    };

    cargarDiagrama();
  }, [idDiagrama]);

  // Handler para volver
  const handleVolver = () => {
    const fromPath = location.state?.from || '/proyectos';
    navigate(fromPath);
  };

  if (loading) return <div className="p-8">Cargando diagrama...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="bg-green-50 min-h-screen">
      <div className="flex w-full h-screen">
        <Sidebar onBack={handleVolver} />
        <div className="flex-1 h-screen">
          {estructura && (
            <EditorDiagrama
              estructuraInicial={estructura}
              projectId={projectId}
              diagramaId={diagramaId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorDiagramaPage;