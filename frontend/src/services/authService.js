/**
 * Servicio para manejar la autenticación y operaciones relacionadas con usuarios
 */

const API_URL = 'http://127.0.0.1:8000';

/**
 * Obtiene la información del usuario autenticado
 * @returns {Promise} Promesa que resuelve con los datos del usuario o null si no está autenticado
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_URL}/api/user/`, {
      credentials: 'include', // Importante para enviar cookies
    });
    
    if (!response.ok) {
      throw new Error('No autenticado');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

/**
 * Inicia sesión con Google
 */
export const loginWithGoogle = () => {
  window.location.href = `${API_URL}/auth/login/google-oauth2/`;
};

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise} Promesa que resuelve cuando se completa el logout
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }
    
    return true;
  } catch (error) {
    console.error('Error en logout:', error);
    return false;
  }
};