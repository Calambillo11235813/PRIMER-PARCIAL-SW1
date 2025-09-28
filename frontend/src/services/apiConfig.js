/**
 * Configuración global para las llamadas a la API
 */

export const API_URL = 'http://127.0.0.1:8000';
export const API_ENDPOINTS = {
  USUARIO: '/api/usuarios/',
  LOGIN: '/api/token/',
  REFRESH: '/api/token/refresh/',
  PROYECTOS: '/api/proyectos/',
  DIAGRAMAS: '/api/diagramas/',
  USER_ME: '/api/me/',
};

// Storage keys: unificadas
const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

/**
 * Guardado de tokens:
 * - Por defecto guarda en sessionStorage (sesión por pestaña).
 * - Si persistente=true guarda en localStorage (permanece entre pestañas).
 */
export function setAccessToken(token, { persistente = false } = {}) {
  const storage = persistente ? window.localStorage : window.sessionStorage;
  storage.setItem(ACCESS_KEY, token);
}
export function setRefreshToken(token, { persistente = false } = {}) {
  const storage = persistente ? window.localStorage : window.sessionStorage;
  storage.setItem(REFRESH_KEY, token);
}

/**
 * Obtención de token:
 * - Prioriza sessionStorage (sesión actual por pestaña).
 * - Si no existe en sessionStorage, usa localStorage (persistente).
 */
export function getToken() {
  return window.sessionStorage.getItem(ACCESS_KEY) || window.localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  return window.sessionStorage.getItem(REFRESH_KEY) || window.localStorage.getItem(REFRESH_KEY);
}

/**
 * Eliminación de tokens: limpiar ambos storages para asegurar logout completo.
 */
export function removeToken() {
  window.sessionStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(ACCESS_KEY);
}
export function removeRefreshToken() {
  window.sessionStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

// Compatibilidad: alias histórico setToken -> setAccessToken
export function setToken(token, opts = {}) { return setAccessToken(token, opts); }

// apiClient (sin cambios de firma) pero usa getToken/getRefreshToken anteriores
export const apiClient = {
  async request(method, url, data = null, _retry = false) {
    const fullUrl = API_URL + url;
    const skipAuth = url.includes(API_ENDPOINTS.LOGIN) || url.includes(API_ENDPOINTS.REFRESH);
    if (!skipAuth) {
      const token = getToken();
      if (!token) {
        console.error('DEBUG: No hay token disponible.');
        const err = new Error('No hay token disponible.');
        err.status = 401;
        throw err;
      }
    }

    const headers = { 'Accept': 'application/json' };
    if (getToken() && !skipAuth) headers['Authorization'] = `Bearer ${getToken()}`;
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    try {
      let resp = await fetch(fullUrl, options);
      const text = await resp.text();
      const json = text ? JSON.parse(text) : null;

      if (!resp.ok) {
        const tokenInvalid = json && (json.code === 'token_not_valid' || (json.detail && json.detail.toString().toLowerCase().includes('token_not_valid')));
        if (resp.status === 401 && tokenInvalid && !_retry) {
          const refresh = getRefreshToken();
          if (refresh) {
            const refreshRes = await fetch(API_URL + API_ENDPOINTS.REFRESH, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ refresh }),
            });
            const refreshText = await refreshRes.text();
            const refreshJson = refreshText ? JSON.parse(refreshText) : null;
            if (refreshRes.ok && refreshJson.access) {
              // guardar nuevo access y reintentar
              setAccessToken(refreshJson.access);
              if (refreshJson.refresh) setRefreshToken(refreshJson.refresh);
              return this.request(method, url, data, true);
            } else {
              removeToken();
              removeRefreshToken();
              const error = new Error('Refresh token inválido.');
              error.status = 401;
              error.data = refreshJson;
              throw error;
            }
          }
        }

        const error = new Error(`HTTP error! status: ${resp.status}`);
        error.status = resp.status;
        error.data = json;
        throw error;
      }

      return { status: resp.status, data: json };
    } catch (error) {
      console.error('DEBUG: Error en la solicitud:', error);
      throw error;
    }
  },

  get(url) { return this.request('GET', url); },
  post(url, data) { return this.request('POST', url, data); },
  put(url, data) { return this.request('PUT', url, data); },
  delete(url) { return this.request('DELETE', url); },
};