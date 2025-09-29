import { apiClient, API_ENDPOINTS } from './apiConfig.js';

export const proyectoService = {
  /**
   * Obtiene la lista de todos los proyectos.
   * Si se pasa usuarioId, obtiene los proyectos del usuario.
   * @param {number} usuarioId - ID del usuario (opcional).
   * @returns {Promise<Array>} Lista de proyectos.
   */
  async obtenerProyectos(usuarioId = null) {
    if (usuarioId) {
      const url = `${API_ENDPOINTS.PROYECTOS}usuario/${usuarioId}/`;
      return await apiClient.get(url);
    }
    return await apiClient.get(API_ENDPOINTS.PROYECTOS);
  },

  /**
   * Crea un nuevo proyecto.
   * @param {Object} datosProyecto - { nombre, descripcion }
   * @returns {Promise<Object>} Proyecto creado.
   */
  async crearProyecto(datosProyecto) {
    // POST /proyectos/
    return await apiClient.post(API_ENDPOINTS.PROYECTOS, datosProyecto);
  },

  /**
   * Obtiene los detalles de un proyecto específico.
   * @param {number} idProyecto - ID del proyecto.
   * @returns {Promise<Object>} Detalles del proyecto.
   */
  async obtenerProyectoPorId(idProyecto) {
    // GET /proyectos/<id>/
    return await apiClient.get(`${API_ENDPOINTS.PROYECTOS}${idProyecto}/`);
  },

  /**
   * Actualiza un proyecto existente.
   * @param {number} idProyecto - ID del proyecto.
   * @param {Object} datosProyecto - { nombre, descripcion }
   * @returns {Promise<Object>} Proyecto actualizado.
   */
  async actualizarProyecto(idProyecto, datosProyecto) {
    // PUT /proyectos/<id>/
    return await apiClient.put(`${API_ENDPOINTS.PROYECTOS}${idProyecto}/`, datosProyecto);
  },

  /**
   * Elimina un proyecto.
   * @param {number} idProyecto - ID del proyecto.
   * @returns {Promise<Object>} Confirmación de eliminación.
   */
  async eliminarProyecto(idProyecto) {
    // DELETE /proyectos/<id>/
    return await apiClient.delete(`${API_ENDPOINTS.PROYECTOS}${idProyecto}/`);
  },

  // -------------------
  // Métodos de invitaciones
  // -------------------

  /**
   * Obtiene las invitaciones de un proyecto.
   * @param {number} idProyecto
   * @returns {Promise<Object>}
   */
  async obtenerInvitaciones(idProyecto) {
    return await apiClient.get(`${API_ENDPOINTS.PROYECTOS}${idProyecto}/invitaciones/`);
  },

  /**
   * Crear/Enviar una invitación para un proyecto.
   * payload: { correo_electronico, rol }
   * @param {number} idProyecto
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async invitar(idProyecto, payload) {
    return await apiClient.post(`${API_ENDPOINTS.PROYECTOS}${idProyecto}/invitaciones/`, payload);
  },

  /**
   * Aceptar invitación (endpoint global).
   * @param {string} token
   * @returns {Promise<Object>}
   */
  async aceptarInvitacion(token) {
    return await apiClient.post(API_ENDPOINTS.INVITACIONES_ACEPTAR, { token });
  }
};