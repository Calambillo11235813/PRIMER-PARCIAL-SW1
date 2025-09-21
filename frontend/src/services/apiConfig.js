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
    const token = getToken();
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    // Debug: mostrar token presence (no mostrar token completo en producción)
    console.debug('apiClient.request', { method, fullUrl, hasToken: !!token });

    // Helper para parsear body seguro
    const parseResponse = async (resp) => {
      const text = await resp.text();
      const json = text ? JSON.parse(text) : null;
      return { resp, json };
    };

    try {
      let resp = await fetch(fullUrl, options);
      let parsed = await parseResponse(resp);

      // Si recibimos 401 intentamos refresh (una vez) si hay refresh token
      if (!resp.ok && resp.status === 401) {
        const refresh = getRefreshToken();
        if (refresh) {
          console.debug('apiClient: detected 401, attempting token refresh');
          try {
            const refreshResp = await fetch(API_URL + API_ENDPOINTS.REFRESH, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ refresh }),
            });
            const refreshBodyText = await refreshResp.text();
            const refreshBody = refreshBodyText ? JSON.parse(refreshBodyText) : null;
            if (refreshResp.ok && refreshBody?.access) {
              // guardar nuevo access token
              setAccessToken(refreshBody.access);
              console.debug('apiClient: token refreshed, retrying original request');

              // retry original request with new token
              headers['Authorization'] = `Bearer ${refreshBody.access}`;
              options.headers = headers;
              resp = await fetch(fullUrl, options);
              parsed = await parseResponse(resp);
            } else {
              // refresh failed -> limpiar tokens y lanzar
              console.warn('apiClient: refresh failed', { refreshRespStatus: refreshResp.status, refreshBody });
              removeToken();
              removeRefreshToken();
            }
          } catch (refreshErr) {
            console.error('apiClient: error during refresh', refreshErr);
            removeToken();
            removeRefreshToken();
          }
        } else {
          console.debug('apiClient: no refresh token available');
        }
      }

      // Ahora procesar respuesta final
      if (!parsed.resp.ok) {
        const error = new Error(`HTTP error! status: ${parsed.resp.status}`);
        error.status = parsed.resp.status;
        error.data = parsed.json;
        console.error(`apiClient: Error en ${method} ${fullUrl}:`, error.data);
        throw error;
      }

      return { status: parsed.resp.status, data: parsed.json };
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