/**
 * Configuración global para las llamadas a la API
 */

export const API_URL = 'http://127.0.0.1:8000';
export const API_ENDPOINTS = {
  USUARIO: '/api/usuarios/',
  LOGIN: '/api/token/',           // JWT login endpoint
  REFRESH: '/api/token/refresh/', // JWT refresh endpoint
  PROYECTOS: '/api/proyectos/',
  DIAGRAMAS: '/api/diagramas/', // <-- Agregado endpoint de diagramas
  USER_ME: '/api/me/',
};

export function setToken(token) { localStorage.setItem('jwt', token); } // compat
export function setAccessToken(token) { localStorage.setItem('jwt', token); }
export function setRefreshToken(token) { localStorage.setItem('refresh', token); }
export function getToken() { return localStorage.getItem('jwt'); }
export function getRefreshToken() { return localStorage.getItem('refresh'); }
export function removeToken() { localStorage.removeItem('jwt'); }
export function removeRefreshToken() { localStorage.removeItem('refresh'); }

export const apiClient = {
  // Firma original: request(method, url, data)
  async request(method, url, data = null) {
    const fullUrl = API_URL + url;

    // Excluir la verificación del token para el endpoint de inicio de sesión
    if (!url.includes(API_ENDPOINTS.LOGIN)) {
      const token = getToken();
      if (!token) {
        console.error('DEBUG: No hay token disponible. Redirigiendo al inicio de sesión.');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw new Error('No hay token disponible. Redirigiendo al inicio de sesión.');
      }
    }

    const headers = { 'Accept': 'application/json' };
    if (getToken()) headers['Authorization'] = `Bearer ${getToken()}`;
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    console.log('DEBUG: Enviando token en la solicitud:', headers['Authorization']);

    try {
      let resp = await fetch(fullUrl, options);
      const parseResponse = async (resp) => {
        const text = await resp.text();
        const json = text ? JSON.parse(text) : null;
        return { resp, json };
      };
      let parsed = await parseResponse(resp);

      if (!parsed.resp.ok) {
        const error = new Error(`HTTP error! status: ${parsed.resp.status}`);
        error.status = parsed.resp.status;
        error.data = parsed.json;
        console.error(`apiClient: Error en ${method} ${fullUrl}:`, error.data);
        throw error;
      }

      return { status: parsed.resp.status, data: parsed.json };
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