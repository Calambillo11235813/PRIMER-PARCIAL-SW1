import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { ClaseNodeModel } from './ClaseNodeModel';
import ClaseNodeWidget from './ClaseNodeWidget';  // Cambia a default import

export class ClaseNodeFactory extends AbstractReactFactory {
  constructor() {
    super('clase');
  }

  generateModel(event) {
    return new ClaseNodeModel();
  }

  generateReactWidget(event) {
    console.log('DEBUG ClaseNodeFactory: Generando widget de clase');
    return <ClaseNodeWidget node={event.model} engine={this.engine} />;
  }
}