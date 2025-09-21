/**
 * Servicio para manejar operaciones relacionadas con diagramas UML
 */
import { apiClient, API_ENDPOINTS } from './apiConfig';

/**
 * Obtiene todos los diagramas
 */
export const obtenerDiagramas = async () => {
  return await apiClient.get(API_ENDPOINTS.DIAGRAMAS);
};

/**
 * Obtiene los datos de un diagrama específico
 * @param {number|string} idDiagrama
 */
export const obtenerDiagramaPorId = async (idDiagrama) => {
  return await apiClient.get(`${API_ENDPOINTS.DIAGRAMAS}${idDiagrama}/`);
};

/**
 * Crea un nuevo diagrama
 * @param {Object} datosDiagrama
 */
export const crearDiagrama = async (datosDiagrama) => {
  return await apiClient.post(API_ENDPOINTS.DIAGRAMAS, datosDiagrama);
};

/**
 * Actualiza un diagrama existente
 * @param {number|string} idDiagrama
 * @param {Object} datosDiagrama  // puede ser { estructura: {...} } o directamente la estructura
 */
export const actualizarDiagrama = async (idDiagrama, datosDiagrama) => {
  // Aceptar ambos formatos: si pasaron { estructura: ... } usarlo; si pasaron la estructura directamente, envolverla.
  const estructuraPayload = datosDiagrama && datosDiagrama.estructura
    ? datosDiagrama.estructura
    : datosDiagrama || { clases: [], relaciones: [] };

  const payload = { estructura: estructuraPayload };

  // Enviar solo el campo estructura al backend
  return await apiClient.put(`${API_ENDPOINTS.DIAGRAMAS}${idDiagrama}/`, payload);
};

/**
 * Elimina un diagrama
 * @param {number|string} idDiagrama
 */
export const eliminarDiagrama = async (idDiagrama) => {
  return await apiClient.delete(`${API_ENDPOINTS.DIAGRAMAS}${idDiagrama}/`);
};