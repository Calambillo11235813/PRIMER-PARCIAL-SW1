/**
 * Servicio para manejar operaciones relacionadas con diagramas UML
 */

const API_URL = 'http://127.0.0.1:8000/api';

/**
 * Obtiene los datos de un diagrama específico
 * @param {string} diagramId - ID del diagrama
 * @returns {Promise} Promesa que resuelve con los datos del diagrama
 */
export const getDiagramById = async (diagramId) => {
  try {
    const response = await fetch(`${API_URL}/diagrams/${diagramId}/`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener diagrama');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getDiagramById:', error);
    throw error;
  }
};

/**
 * Guarda los cambios de un diagrama
 * @param {string} diagramId - ID del diagrama
 * @param {Object} diagramData - Datos del diagrama a guardar
 * @returns {Promise} Promesa que resuelve con el diagrama actualizado
 */
export const saveDiagram = async (diagramId, diagramData) => {
  try {
    const response = await fetch(`${API_URL}/diagrams/${diagramId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(diagramData),
    });
    
    if (!response.ok) {
      throw new Error('Error al guardar diagrama');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en saveDiagram:', error);
    throw error;
  }
};

/**
 * Genera código a partir de un diagrama UML
 * @param {string} diagramId - ID del diagrama
 * @returns {Promise} Promesa que resuelve con la URL del código generado
 */
export const generateCode = async (diagramId) => {
  try {
    const response = await fetch(`${API_URL}/diagrams/${diagramId}/generate-code/`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error al generar código');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en generateCode:', error);
    throw error;
  }
};