
/**
 * Genera un id de handle válido para el nodo destino, usando el mismo patrón que ClaseNodeRF.
 * Si el handle original era 'right-src-35', al invertir será 'right-tgt-35' en el otro nodo.
 * Si no se puede deducir, retorna el primer handle posible.
 * 
 * @param {string} nodoId - ID del nodo destino
 * @param {string} handleOriginal - id del handle original (ej: 'claseNode-xxx-right-src-35')
 * @param {string} tipo - 'source' o 'target'
 * @returns {string} id del handle válido
 */
export function getHandleValidoInvertido(nodoId, handleOriginal, tipo = 'source') {
  if (handleOriginal) {
    // Extrae la posición y el offset del handle original
    const partes = handleOriginal.split('-');
    // Ejemplo: ['claseNode', 'xxx', 'right', 'src', '35']
    const position = partes[2] || 'right';
    const offset = partes[4] || '35';
    // Construye el nuevo id con el tipo invertido
    return `${nodoId}-${position}-${tipo === 'source' ? 'src' : 'tgt'}-${offset}`;
  }
  // Si no hay handle original, retorna uno por defecto
  return `${nodoId}-right-${tipo === 'source' ? 'src' : 'tgt'}-35`;
}