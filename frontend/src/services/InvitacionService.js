import { apiClient, API_ENDPOINTS } from './apiConfig.js';

export const invitacionService = {
  /**
   * Obtener todas las invitaciones de un proyecto.
   * GET /api/proyectos/:idProyecto/invitaciones/listar/
   */
  obtenerInvitaciones(idProyecto) {
    const path = API_ENDPOINTS.INVITACIONES_LISTAR.replace('{pk}', encodeURIComponent(idProyecto));
    return apiClient.get(path);
  },

  /**
   * Obtener invitaciones creadas por un usuario en un proyecto.
   * GET /api/proyectos/:idProyecto/invitaciones/usuario/:usuarioId/
   */
  obtenerInvitacionesPorUsuario(idProyecto, usuarioId) {
    const path = API_ENDPOINTS.INVITACIONES_POR_USUARIO
      .replace('{pk}', encodeURIComponent(idProyecto))
      .replace('{usuario_id}', encodeURIComponent(usuarioId));
    return apiClient.get(path);
  },

  /**
   * Crear/enviar una invitación.
   * POST /api/proyectos/:idProyecto/invitaciones/
   * payload: { correo_electronico, rol }
   */
  invitar(idProyecto, payload) {
    const path = API_ENDPOINTS.INVITACIONES_CREAR.replace('{pk}', encodeURIComponent(idProyecto));
    return apiClient.post(path, payload);
  },

  /**
   * Aceptar invitación.
   * POST /api/invitaciones/aceptar/  { token }
   */
  aceptarInvitacion(token) {
    return apiClient.post(API_ENDPOINTS.INVITACIONES_ACEPTAR, { token });
  },
};