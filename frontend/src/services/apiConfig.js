/**
 * Configuración global para las llamadas a la API
 */

export const API_URL = 'http://127.0.0.1:8000';
export const API_ENDPOINTS = {
  USUARIO: '/api/usuarios/',
  LOGIN: '/api/login/',
  LOGOUT: '/api/logout/',
  PROYECTOS: '/api/proyectos/',
  USER_ME: '/api/me/',
};

/** obtiene una cookie por nombre (csrftoken) */
function getCookie(name) {
  const matches = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return matches ? decodeURIComponent(matches[1]) : null;
}

/** cliente HTTP usando fetch y enviando credenciales */
export const apiClient = {
  async request(method, url, data = null) {
    const fullUrl = API_URL + url;
    console.log(`apiClient: ${method} llamada a`, fullUrl, data ? 'con datos:' : '');
    const headers = { 'Accept': 'application/json' };
    if (method !== 'GET') {
      headers['Content-Type'] = 'application/json';
      const csrftoken = getCookie('csrftoken');
      if (csrftoken) headers['X-CSRFToken'] = csrftoken;
    }
    const options = {
      method,
      headers,
      credentials: 'include', // <-- IMPORTANTE: enviar cookies de sesión
    };
    if (data) options.body = JSON.stringify(data);

    // DEBUG: mostrar token CSRF y opciones enviadas al fetch (no mostrar password en logs)
    console.log('apiClient DEBUG: csrftoken=', getCookie('csrftoken'));
    console.log('apiClient DEBUG: options antes de fetch =', { method: options.method, headers: options.headers, credentials: options.credentials, bodyPreview: data ? Object.keys(data) : null });

    try {
      const resp = await fetch(fullUrl, options);
      console.log('apiClient DEBUG: response headers =', Array.from(resp.headers.entries()));
      console.log('apiClient: Respuesta status:', resp.status);
      const text = await resp.text();
      const json = text ? JSON.parse(text) : null;
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      console.log('apiClient: Datos recibidos:', json);
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
};