// utils/diagramSerialization.js

/**
 * Serializa la estructura actual del diagrama para persistencia
 * 
 * @param {Array} nodes - Nodos del diagrama
 * @param {Array} edges - Relaciones del diagrama
 * @returns {Object} Estructura serializada del diagrama
 */
export const serializarEstructura = (nodes, edges) => {
  const clases = nodes.map((nodo) => ({
    id: nodo.id,
    nombre: nodo.data?.nombre || nodo.data?.label,
    estereotipo: nodo.data?.estereotipo,
    atributos: nodo.data?.atributos || [],
    metodos: nodo.data?.metodos || [],
    esAbstracta: nodo.data?.esAbstracta || false,
    position: nodo.position,
  }));

  const relaciones = edges.map((relacion) => ({
    id: relacion.id || `${relacion.source}_${relacion.target}`,
    source: relacion.source,
    sourceHandle: relacion.sourceHandle || null,   // ✅ Guardar handle de origen
    target: relacion.target,
    targetHandle: relacion.targetHandle || null,   // ✅ Guardar handle de destino
    tipo: relacion.data?.tipo || 'asociacion',
    multiplicidadSource: relacion.data?.multiplicidadSource || '1',
    multiplicidadTarget: relacion.data?.multiplicidadTarget || 'N',
    label: relacion.data?.label || null,
    layout: relacion.data?.layout || 'straight',
  }));

  return { clases, relaciones };
};

/**
 * Deserializa estructura desde el backend para el editor
 * 
 * @param {Object} estructura - Estructura del backend
 * @returns {Object} Datos preparados para React Flow
 */
export const deserializarEstructura = (estructura) => {
  if (!estructura) return { nodes: [], edges: [] };

  const nodes = estructura.clases?.map((clase, index) => ({
    id: clase.id || `node-${index}`,
    type: 'claseNode',
    position: clase.position || { x: 100 + index * 200, y: 100 },
    data: { 
      ...clase, 
      label: clase.nombre || `Clase ${index + 1}` 
    }
  })) || [];

  const edges = estructura.relaciones?.map((relacion, index) => ({
    id: relacion.id || `edge-${index}`,
    source: relacion.source,
    sourceHandle: relacion.sourceHandle || null,   // ✅ Restaurar handle de origen
    target: relacion.target,
    targetHandle: relacion.targetHandle || null,   // ✅ Restaurar handle de destino
    type: 'relacionNode',
    data: {
      tipo: relacion.tipo || 'asociacion',
      multiplicidadSource: relacion.multiplicidadSource || '1',
      multiplicidadTarget: relacion.multiplicidadTarget || 'N',
      label: relacion.label || null,
      layout: relacion.layout || 'straight',
    },
  })) || [];

  return { nodes, edges };
};
