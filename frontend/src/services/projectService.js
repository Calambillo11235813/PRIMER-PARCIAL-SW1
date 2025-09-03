/**
 * Servicio para manejar operaciones relacionadas con proyectos UML
 */

const API_URL = 'http://127.0.0.1:8000/api';

/**
 * Obtiene todos los proyectos del usuario autenticado
 * @returns {Promise} Promesa que resuelve con la lista de proyectos
 */
export const getUserProjects = async () => {
  try {
    const response = await fetch(`${API_URL}/projects/`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener proyectos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getUserProjects:', error);
    return [];
  }
};

/**
 * Obtiene los detalles de un proyecto específico
 * @param {string} projectId - ID del proyecto
 * @returns {Promise} Promesa que resuelve con los detalles del proyecto
 */
export const getProjectById = async (projectId) => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener el proyecto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getProjectById:', error);
    throw error;
  }
};

/**
 * Crea un nuevo proyecto UML
 * @param {Object} projectData - Datos del nuevo proyecto
 * @returns {Promise} Promesa que resuelve con el proyecto creado
 */
export const createProject = async (projectData) => {
  try {
    const response = await fetch(`${API_URL}/projects/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear proyecto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en createProject:', error);
    throw error;
  }
};

/**
 * Actualiza un proyecto existente
 * @param {string} projectId - ID del proyecto
 * @param {Object} projectData - Datos actualizados
 * @returns {Promise} Promesa que resuelve con el proyecto actualizado
 */
export const updateProject = async (projectId, projectData) => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar proyecto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en updateProject:', error);
    throw error;
  }
};

/**
 * Elimina un proyecto
 * @param {string} projectId - ID del proyecto a eliminar
 * @returns {Promise} Promesa que resuelve cuando se completa la eliminación
 */
export const deleteProject = async (projectId) => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar proyecto');
    }
    
    return true;
  } catch (error) {
    console.error('Error en deleteProject:', error);
    throw error;
  }
};