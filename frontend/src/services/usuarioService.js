import { API_URL, API_ENDPOINTS, apiClient } from './apiConfig';

/**
 * Lista todos los usuarios
 */
export const listarUsuarios = async () => {
  return await apiClient.get(API_ENDPOINTS.USUARIO);
};

/**
 * Crea un nuevo usuario
 * @param {Object} datosUsuario
 */
export const crearUsuario = async (datosUsuario) => {
  return await apiClient.post(API_ENDPOINTS.USUARIO, datosUsuario);
};

/**
 * Obtiene los datos de un usuario por ID
 * @param {number} id
 */
export const obtenerUsuarioPorId = async (id) => {
  return await apiClient.get(`${API_ENDPOINTS.USUARIO}${id}/`);
};

/**
 * Actualiza los datos de un usuario por ID
 * @param {number} id
 * @param {Object} datosActualizados
 */
export const actualizarUsuario = async (id, datosActualizados) => {
  return await apiClient.put(`${API_ENDPOINTS.USUARIO}${id}/`, datosActualizados);
};

/**
 * Elimina un usuario por ID
 * @param {number} id
 */
export const eliminarUsuario = async (id) => {
  return await apiClient.delete(`${API_ENDPOINTS.USUARIO}${id}/`);
};