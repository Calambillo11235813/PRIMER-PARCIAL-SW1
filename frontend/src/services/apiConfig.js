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

export function setToken(token) { localStorage.setItem('jwt', token); }
export function getToken() { return localStorage.getItem('jwt'); }
export function removeToken() { localStorage.removeItem('jwt'); }

export const apiClient = {
  // Firma original: request(method, url, data)
  async request(method, url, data = null) {
    const fullUrl = API_URL + url;
    const headers = { 'Accept': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    try {
      const resp = await fetch(fullUrl, options);
      const text = await resp.text();
      const json = text ? JSON.parse(text) : null;
      if (!resp.ok) {
        const error = new Error(`HTTP error! status: ${resp.status}`);
        error.status = resp.status;
        error.data = json;
        console.error(`apiClient: Error en ${method} ${fullUrl}:`, error.data);
        throw error;
      }
      return { status: resp.status, data: json };
    } catch (error) {
      console.error(`apiClient: Error en ${method}:`, error);
      throw error;
    }
  },

  get(url) { return this.request('GET', url); },
  post(url, data) { return this.request('POST', url, data); },
  put(url, data) { return this.request('PUT', url, data); },
  delete(url) { return this.request('DELETE', url); },

  // Nueva función genérica que acepta (path, options) y devuelve el body (útil para usos donde
  // queremos parsear el JSON de error y lanzarlo)
  async requestRaw(path, options = {}) {
    const res = await fetch(API_URL + path, options);
    const contentType = res.headers.get('content-type') || '';
    let body = null;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    if (!res.ok) {
      const error = new Error(`HTTP error! status: ${res.status}`);
      error.status = res.status;
      error.data = body;
      console.error('apiClient: Error en requestRaw:', { path, status: res.status, body });
      throw error;
    }
    return body;
  },
};