/**
 * Servicio para manejar la autenticación y operaciones relacionadas con usuarios
 */
import { API_ENDPOINTS, apiClient } from './apiConfig';

/**
 * Obtiene la información del usuario autenticado
 * @returns {Promise<Object|null>}
 */
export const getCurrentUser = async () => {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.USER_ME);
    return resp.data || null;
  } catch (error) {
    console.error('getCurrentUser: Error obteniendo usuario actual:', error);
    return null;
  }
};

/**
 * Iniciar sesión (usa cookies de sesión)
 * @param {string} correo
 * @param {string} password
 * @returns {Promise<Object>} respuesta del backend (ej. {mensaje, usuario})
 */
export const login = async (correo, password) => {
  try {
    const resp = await apiClient.post(API_ENDPOINTS.LOGIN, { correo_electronico: correo, password });
    // devolver usuario si backend lo incluye
    return resp.data?.usuario ?? resp.data ?? null;
  } catch (error) {
    console.error('authService.login error:', error);
    throw error;
  }
};

/**
 * Cerrar sesión
 * @returns {Promise<boolean>}
 */
export const logout = async () => {
  try {
    await apiClient.post(API_ENDPOINTS.LOGOUT, {});
    return true;
  } catch (error) {
    console.error('authService.logout error:', error);
    return false;
  }
};