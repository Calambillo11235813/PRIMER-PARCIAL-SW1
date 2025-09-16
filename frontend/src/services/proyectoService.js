import { apiClient, API_ENDPOINTS } from './apiConfig.js';

/**
 * Servicio para gestionar proyectos UML.
 * Proporciona funciones para CRUD de proyectos.
 */
export const proyectoService = {
  /**
   * Obtiene la lista de todos los proyectos.
   * @returns {Promise} Lista de proyectos.
   */
  obtenerProyectos: async () => {
    return await apiClient.get(API_ENDPOINTS.PROYECTOS);
  },

  /**
   * Crea un nuevo proyecto.
   * @param {Object} datosProyecto - Datos del proyecto (nombre, descripcion).
   * @returns {Promise} Proyecto creado.
   */
  crearProyecto: async (datosProyecto) => {
    return await apiClient.post(API_ENDPOINTS.PROYECTOS, datosProyecto);
  },

  /**
   * Obtiene los detalles de un proyecto específico.
   * @param {number} idProyecto - ID del proyecto.
   * @returns {Promise} Detalles del proyecto.
   */
  obtenerProyectoPorId: async (idProyecto) => {
    return await apiClient.get(`${API_ENDPOINTS.PROYECTOS}${idProyecto}/`);
  },

  /**
   * Actualiza un proyecto existente.
   * @param {number} idProyecto - ID del proyecto.
   * @param {Object} datosProyecto - Datos actualizados (nombre, descripcion).
   * @returns {Promise} Proyecto actualizado.
   */
  actualizarProyecto: async (idProyecto, datosProyecto) => {
    return await apiClient.put(`${API_ENDPOINTS.PROYECTOS}${idProyecto}/`, datosProyecto);
  },

  /**
   * Elimina un proyecto.
   * @param {number} idProyecto - ID del proyecto.
   * @returns {Promise} Confirmación de eliminación.
   */
  eliminarProyecto: async (idProyecto) => {
    return await apiClient.delete(`${API_ENDPOINTS.PROYECTOS}${idProyecto}/`);
  },
};