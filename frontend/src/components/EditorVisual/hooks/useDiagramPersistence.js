// hooks/useDiagramPersistence.js
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

import { crearDiagrama, actualizarDiagrama } from '../../../services/diagramService';
import { apiClient } from '../../../services/apiConfig';

import { serializarEstructura } from '../utils_1/diagramSerialization';

/**
 * Hook para gestionar la persistencia de diagramas
 * 
 * @param {Object} editorState - Estado del editor (nodes, edges)
 * @param {Object} history - Hook de historial
 * @param {string} projectId - ID del proyecto (opcional)
 * @param {string} diagramaId - ID del diagrama (opcional)
 * @returns {Object} Estado y funciones de persistencia
 */
export const useDiagramPersistence = (editorState, history, projectId = null, diagramaId = null) => {
  const { nodes, edges } = editorState;
  const { saveState } = history;

  const [estaGuardando, setEstaGuardando] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  const [erroresValidacion, setErroresValidacion] = useState(null);
  const [claseEditando, setClaseEditando] = useState(null);

  /**
   * Serializar estructura actual del diagrama
   */
  const serializarDiagramaActual = useCallback((nodesSnapshot = null, edgesSnapshot = null) => {
    return serializarEstructura(nodesSnapshot || nodes, edgesSnapshot || edges);
  }, [nodes, edges]);

  /**
   * Persistir diagrama en el backend
   */
  const persistirDiagrama = useCallback(async (estructuraSnapshot = null) => {
    const estructura = estructuraSnapshot || serializarDiagramaActual();

    const payload = {
      nombre: 'Diagrama',
      descripcion: '',
      proyecto: projectId,
      estructura
    };

    setEstaGuardando(true);

    try {
      let respuesta;
      if (diagramaId) {
        respuesta = await actualizarDiagrama(diagramaId, payload);
      } else {
        respuesta = await crearDiagrama(payload);
      }

      setNotificacion({ tipo: 'exito', mensaje: 'Diagrama guardado correctamente' });
      return respuesta?.data ?? respuesta;
    } catch (error) {
      console.error('Error al guardar el diagrama:', error);

      let mensajeError = 'Error al guardar el diagrama';
      if (error.response?.status === 401) {
        mensajeError = 'Error de autenticación. Verifique su sesión.';
      } else if (error.response?.data?.detail) {
        mensajeError = error.response.data.detail;
      }

      setNotificacion({ tipo: 'error', mensaje: mensajeError });
      throw error;
    } finally {
      setEstaGuardando(false);
    }
  }, [serializarDiagramaActual, projectId, diagramaId]);

  /**
   * Validar diagrama antes de guardar
   */
  const validarDiagrama = useCallback(() => {
    // Validaciones básicas del diagrama
    const errores = [];

    // Ejemplo: Validar que no haya nodos sin nombre
    nodes.forEach((nodo, index) => {
      if (!nodo.data?.nombre?.trim()) {
        errores.push(`El nodo en posición ${index + 1} no tiene nombre`);
      }
    });

    if (errores.length > 0) {
      setErroresValidacion(errores);
      return false;
    }

    setErroresValidacion(null);
    return true;
  }, [nodes]);

  /**
   * Manejar guardado del diagrama
   */
  const manejarGuardadoDiagrama = useCallback(async () => {
    if (!validarDiagrama()) {
      setNotificacion({ tipo: 'error', mensaje: 'El diagrama contiene errores' });
      return;
    }

    try {
      await persistirDiagrama();
    } catch (error) {
      // El error ya se maneja en persistirDiagrama
    }
  }, [validarDiagrama, persistirDiagrama]);

  /**
   * Guardar cambios cuando se edita una clase
   */
  const manejarGuardarClase = useCallback((claseActualizada) => {
    saveState(nodes, edges);
    console.log('useDiagramPersistence.js - manejarGuardarClase:', claseActualizada);

    const nodosActualizados = nodes.map((nodo) =>
      nodo.id === claseEditando?.id
        ? { ...nodo, data: { ...nodo.data, ...claseActualizada } }
        : nodo
    );

    // Actualizar nodes en editorState (se manejará por callback)
    const estructuraSnapshot = serializarDiagramaActual(nodosActualizados, edges);

    persistirDiagrama(estructuraSnapshot);

    return nodosActualizados;
  }, [nodes, edges, claseEditando, saveState, serializarDiagramaActual, persistirDiagrama]);

  /**
   * Limpiar notificación después de un tiempo
   */
  const limpiarNotificacion = useCallback(() => {
    setNotificacion(null);
  }, []);

  /**
   * Persistir relaciones en el backend
   */
  const persistirRelaciones = async (relaciones) => {
    try {
      // Obtén las clases actuales del diagrama
      const clases = nodes.map(nodo => nodo.data);

      // Construye la estructura completa
      const estructura = { clases, relaciones };

      // Usa el endpoint estándar para actualizar el diagrama
      await actualizarDiagrama(diagramaId, { estructura });
      toast.success('Relaciones guardadas correctamente');
    } catch (error) {
      toast.error('Error al guardar relaciones');
      console.error(error);
    }
  };

  return {
    // Estado
    estaGuardando,
    notificacion,
    erroresValidacion,
    claseEditando,

    // Setters
    setClaseEditando,
    setNotificacion,

    // Funciones
    serializarDiagramaActual,
    persistirDiagrama,
    validarDiagrama,
    manejarGuardadoDiagrama,
    manejarGuardarClase,
    limpiarNotificacion,

    // Nuevas funciones
    persistirRelaciones,
  };
};