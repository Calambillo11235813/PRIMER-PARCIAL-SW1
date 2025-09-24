/**
 * Constantes para los elementos del sidebar del editor UML
 */

export const ELEMENTOS_UML = [
  { 
    id: 'clase', 
    label: 'Clase', 
    hint: 'Arrastrar al lienzo', 
    bg: 'bg-green-100', 
    border: 'border-green-200', 
    type: 'claseNode' 
  },
  { 
    id: 'interface', 
    label: 'Interface', 
    hint: 'Arrastrar al lienzo', 
    bg: 'bg-emerald-100', 
    border: 'border-emerald-200', 
    type: 'interfaceNode' 
  },
];

export const RELACIONES_UML = [
  { 
    id: 'asociacion', 
    label: 'Asociación', 
    hint: 'Línea simple', 
    bg: 'bg-white', 
    border: 'border-gray-200', 
    type: 'relacion-asociacion' 
  },
  { 
    id: 'agregacion', 
    label: 'Agregación', 
    hint: 'Diamante hueco (agregación)', 
    bg: 'bg-white', 
    border: 'border-gray-200', 
    type: 'relacion-agregacion' 
  },
  { 
    id: 'composicion', 
    label: 'Composición', 
    hint: 'Diamante relleno (composición)', 
    bg: 'bg-white', 
    border: 'border-gray-200', 
    type: 'relacion-composicion' 
  },
  { 
    id: 'generalizacion', 
    label: 'Generalización', 
    hint: 'Triángulo hueco (generalización)', 
    bg: 'bg-white', 
    border: 'border-gray-200', 
    type: 'relacion-generalizacion' 
  },
  { 
    id: 'realizacion', 
    label: 'Realización', 
    hint: 'Línea punteada + triángulo hueco (realización)', 
    bg: 'bg-white', 
    border: 'border-gray-200', 
    type: 'relacion-realizacion' 
  },
  { 
    id: 'association-class', 
    label: 'Association Class', 
    hint: 'Asociación con caja de clase', 
    bg: 'bg-white', 
    border: 'border-gray-200', 
    type: 'relacion-association-class' 
  },
];