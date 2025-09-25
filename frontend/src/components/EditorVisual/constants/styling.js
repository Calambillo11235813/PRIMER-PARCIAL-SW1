import { TIPOS_RELACION } from './umlTypes';

export const ESTILOS_RELACION = {
  [TIPOS_RELACION.ASOCIACION]: {
    stroke: '#333333',
    strokeWidth: 2,
    strokeDasharray: null,
    fill: 'none'
  },
  [TIPOS_RELACION.COMPOSICION]: {
    stroke: '#333333',
    strokeWidth: 2,
    strokeDasharray: null,
    fill: 'none'
  },
  [TIPOS_RELACION.AGREGACION]: {
    stroke: '#333333',
    strokeWidth: 2,
    strokeDasharray: null,
    fill: 'none'
  },
  [TIPOS_RELACION.HERENCIA]: {
    stroke: '#333333',
    strokeWidth: 2,
    strokeDasharray: null,
    fill: 'none'
  },
  [TIPOS_RELACION.REALIZACION]: {
    stroke: '#333333',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    fill: 'none'
  },
  [TIPOS_RELACION.DEPENDENCIA]: {
    stroke: '#333333',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    fill: 'none'
  },
  [TIPOS_RELACION.ASSOCIATION_CLASS]: {
    stroke: '#333333',
    strokeWidth: 2,
    strokeDasharray: '6,4',
    fill: 'none'
  },
  [TIPOS_RELACION.RECURSIVA]: {
    stroke: '#22c55e', // Verde para destacar la recursiva
    strokeWidth: 2,
    strokeDasharray: '3,3', // Línea punteada corta
    fill: 'none'
  }
};