/**
 * Servicio para manejar la autenticación y operaciones relacionadas con usuarios
 */
import { API_ENDPOINTS, apiClient } from './apiConfig';

/**
 * Obtiene la información del usuario autenticado
 * @returns {Promise} Promesa que resuelve con los datos del usuario o null si no está autenticado
 */
export const getCurrentUser = async () => {
  try {
    return await apiClient.get(API_ENDPOINTS.USUARIO);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

/**
 * Inicia sesión con usuario y contraseña
 * @param {string} correo_electronico
 * @param {string} password
 * @returns {Promise} Promesa con la respuesta del backend
 */
export const login = async (correo_electronico, password) => {
  try {
    return await apiClient.post(API_ENDPOINTS.LOGIN, { correo_electronico, password });
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise} Promesa que resuelve cuando se completa el logout
 */
export const logout = async () => {
  try {
    await apiClient.post(API_ENDPOINTS.LOGOUT);
    return true;
  } catch (error) {
    console.error('Error en logout:', error);
    return false;
  }
};