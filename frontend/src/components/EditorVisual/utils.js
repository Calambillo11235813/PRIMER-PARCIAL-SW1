// Convierte nodos y enlaces del editor visual a estructura JSON UML
export function diagramaToJSON(engine) {
  const model = engine.getModel();
  const clases = model.getNodes().map(node => ({
    nombre: node.getOptions().name,
    atributos: node.getOptions().atributos || []
  }));
  const relaciones = model.getLinks().map(link => ({
    origen: link.getSourcePort().getNode().getOptions().name,
    destino: link.getTargetPort().getNode().getOptions().name,
    tipo: link.getOptions().tipo || 'asociación'
  }));
  return { clases, relaciones };
}

// Puedes agregar más utilidades según lo necesites