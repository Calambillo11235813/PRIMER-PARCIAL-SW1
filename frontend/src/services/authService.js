import { API_ENDPOINTS, apiClient, setToken, removeToken } from './apiConfig';

/**
 * Iniciar sesión con JWT
 * @param {string} correo
 * @param {string} password
 * @returns {Promise<Object>} respuesta del backend (ej. {access, refresh})
 */
export const login = async (correo, password) => {
  try {
    const resp = await apiClient.post(API_ENDPOINTS.LOGIN, {
      correo_electronico: correo, // <-- Este campo debe coincidir con el backend
      password,
    });
    if (resp.data?.access) {
      setToken(resp.data.access);
    }
    return resp.data;
  } catch (error) {
    console.error('authService.login error:', error);
    throw error;
  }
};

/**
 * Cerrar sesión (elimina el token JWT)
 */
export const logout = async () => {
  removeToken();
  return true;
};

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