/**
 * Configuración global para las llamadas a la API
 *
 * - exporta API_URL y API_ENDPOINTS
 * - permite registrar funciones de auth mediante registerAuth (opcional)
 * - exporta apiClient: helper fetch que añade Authorization y maneja refresh
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

// storage keys fallback (usados sólo si authService no provee funciones)
const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

// fallback local implementations (se usan solo si authService no exporta las funciones)
const _fallbackGetToken = () => window.sessionStorage.getItem(ACCESS_KEY) || window.localStorage.getItem(ACCESS_KEY);
const _fallbackGetRefreshToken = () => window.sessionStorage.getItem(REFRESH_KEY) || window.localStorage.getItem(REFRESH_KEY);
const _fallbackSetAccessToken = (token, { persistente = false } = {}) => {
  const storage = persistente ? window.localStorage : window.sessionStorage;
  storage.setItem(ACCESS_KEY, token);
};
const _fallbackSetRefreshToken = (token, { persistente = false } = {}) => {
  const storage = persistente ? window.localStorage : window.sessionStorage;
  storage.setItem(REFRESH_KEY, token);
};
const _fallbackRemoveToken = () => {
  window.sessionStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(ACCESS_KEY);
};
const _fallbackRemoveRefreshToken = () => {
  window.sessionStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
};

// Internal holders (will default to fallbacks)
let _getToken = _fallbackGetToken;
let _getRefreshToken = _fallbackGetRefreshToken;
let _setAccessToken = _fallbackSetAccessToken;
let _setRefreshToken = _fallbackSetRefreshToken;
let _removeToken = _fallbackRemoveToken;
let _removeRefreshToken = _fallbackRemoveRefreshToken;

/**
 * registerAuth(authImpl)
 * - Opcional: authService puede llamar registerAuth({ getToken, getRefreshToken, setAccessToken, ... })
 *   para que apiConfig use sus implementaciones sin crear import circular.
 */
export function registerAuth(authImpl = {}) {
  if (authImpl.getToken) _getToken = authImpl.getToken;
  if (authImpl.getRefreshToken) _getRefreshToken = authImpl.getRefreshToken;
  if (authImpl.setAccessToken) _setAccessToken = authImpl.setAccessToken;
  if (authImpl.setRefreshToken) _setRefreshToken = authImpl.setRefreshToken;
  if (authImpl.removeToken) _removeToken = authImpl.removeToken;
  if (authImpl.removeRefreshToken) _removeRefreshToken = authImpl.removeRefreshToken;
}

// Export the functions (use these inside apiClient)
export const getToken = () => _getToken();
export const getRefreshToken = () => _getRefreshToken();
export const setAccessToken = (t, opts) => _setAccessToken(t, opts);
export const setRefreshToken = (t, opts) => _setRefreshToken(t, opts);
export const removeToken = () => _removeToken();
export const removeRefreshToken = () => _removeRefreshToken();

/**
 * apiClient: helper minimalista usando fetch
 * - path: ruta relativa (ej. API_ENDPOINTS.PROYECTOS + '3/invitaciones/') o URL absoluta
 * - agrega Authorization: Bearer <token> si getToken() devuelve valor
 * - si recibe 401 y respuesta indica token inválido intenta refresh si getRefreshToken() existe
 */
export const apiClient = {
  async request(method, pathOrUrl, data = null, _retry = false) {
    const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API_URL}${pathOrUrl}`;
    const skipAuth = pathOrUrl.includes(API_ENDPOINTS.LOGIN) || pathOrUrl.includes(API_ENDPOINTS.REFRESH);

    const token = !skipAuth ? getToken() : null;
    if (!skipAuth && !token) {
      // No token: la app decide si esto es fatal; devolvemos error para que el caller lo maneje.
      const err = new Error('No hay token disponible.');
      err.status = 401;
      throw err;
    }

    const headers = { Accept: 'application/json' };
    if (token && !skipAuth) headers['Authorization'] = `Bearer ${token}`;
    if (method !== 'GET') headers['Content-Type'] = 'application/json';

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    try {
      const resp = await fetch(url, options);
      const text = await resp.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }

      if (!resp.ok) {
        // manejar token inválido -> intentar refresh (si disponible)
        const tokenInvalid = json && (json.code === 'token_not_valid' || (json.detail && String(json.detail).toLowerCase().includes('token_not_valid')));
        if (resp.status === 401 && tokenInvalid && !_retry) {
          const refresh = getRefreshToken ? getRefreshToken() : null;
          if (refresh) {
            // intentar refresh
            const refreshRes = await fetch(`${API_URL}${API_ENDPOINTS.REFRESH}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ refresh }),
            });
            const refreshText = await refreshRes.text();
            const refreshJson = refreshText ? JSON.parse(refreshText) : null;
            if (refreshRes.ok && refreshJson.access) {
              // guardar nuevo access token y reintentar
              setAccessToken(refreshJson.access);
              if (refreshJson.refresh) setRefreshToken(refreshJson.refresh);
              return this.request(method, pathOrUrl, data, true);
            } else {
              // refresh falló: limpiar tokens y propagar error
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

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  put(path, body) { return this.request('PUT', path, body); },
  delete(path) { return this.request('DELETE', path); },
};