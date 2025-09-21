import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditorDiagrama from '../components/EditorVisual/EditorDiagrama';
import { obtenerDiagramas } from '../services/diagramService';

const EditorDiagramaPage = () => {
  const { idDiagrama } = useParams();
  const [estructura, setEstructura] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const cargar = async () => {
      const resp = await obtenerDiagramas();
      console.log('Diagramas recibidos:', resp.data);
      console.log('idDiagrama:', idDiagrama, typeof idDiagrama);

      // Conversión explícita a número
      const diagrama = (resp.data || []).find(d => d.id === Number(idDiagrama));
      console.log('Diagrama encontrado:', diagrama);

      // Verifica si la estructura existe y tiene datos
      if (diagrama && diagrama.estructura && Object.keys(diagrama.estructura).length > 0) {
        setEstructura(diagrama.estructura);
      } else {
        setEstructura({ clases: [], relaciones: [] });
      }
    };
    cargar();
  }, [idDiagrama]);

  if (!estructura) return <div className="p-8">Cargando diagrama...</div>;

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