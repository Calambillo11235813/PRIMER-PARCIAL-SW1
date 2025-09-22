import { API_ENDPOINTS, apiClient, setToken, setRefreshToken, removeToken } from './apiConfig';

/**
 * Iniciar sesión con JWT
 * @param {string} correo
 * @param {string} password
 * @returns {Promise<Object>} respuesta del backend (ej. {access, refresh})
 */
export const login = async (correo, password) => {
  try {
    const resp = await apiClient.post(API_ENDPOINTS.LOGIN, {
      correo_electronico: correo,
      password,
    });

    if (resp?.data?.access) {
      setToken(resp.data.access); // Guardar el access token
      setRefreshToken(resp.data.refresh); // Guardar el refresh token
      return resp.data;
    } else {
      throw new Error('No se recibió un token de acceso válido.');
    }
  } catch (error) {
    console.error('authService.login error:', error);

    // Manejo de errores específicos
    if (error.response?.status === 401) {
      throw new Error('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
    } else {
      throw new Error('Error al conectar con el servidor. Inténtalo de nuevo más tarde.');
    }
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