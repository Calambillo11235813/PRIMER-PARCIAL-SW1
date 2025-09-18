import { apiClient, API_ENDPOINTS } from './apiConfig.js';

/**
 * Servicio para gestionar proyectos UML.
 * Proporciona funciones para CRUD de proyectos.
 * 
 * Ejemplo de uso:
 *   const proyectos = await proyectoService.obtenerProyectos();
 *   const nuevo = await proyectoService.crearProyecto({ nombre, descripcion });
 */
export const proyectoService = {
  /**
   * Obtiene la lista de todos los proyectos.
   * @returns {Promise<Array>} Lista de proyectos.
   */
  async obtenerProyectos() {
    // GET /proyectos/
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
};