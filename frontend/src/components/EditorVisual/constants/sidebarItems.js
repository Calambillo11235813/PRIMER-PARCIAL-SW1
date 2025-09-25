import { TIPOS_RELACION } from './umlTypes';

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
  { id: TIPOS_RELACION.ASOCIACION, label: 'Asociación', hint: 'Línea simple', descripcion: '...' },
  { id: TIPOS_RELACION.AGREGACION, label: 'Agregación', hint: 'Diamante hueco', descripcion: '...' },
  { id: TIPOS_RELACION.COMPOSICION, label: 'Composición', hint: 'Diamante relleno', descripcion: '...' },
  { id: TIPOS_RELACION.HERENCIA, label: 'Generalización', hint: 'Triángulo hueco', descripcion: '...' },
  { id: TIPOS_RELACION.REALIZACION, label: 'Realización', hint: 'Línea punteada + triángulo', descripcion: '...' },
  { id: TIPOS_RELACION.ASSOCIATION_CLASS, label: 'Association Class', hint: 'Asociación con caja de clase', descripcion: '...' },
];