import { ClaseNodeWidget } from './ClaseNodeWidget';
import { ClaseNodeModel } from './ClaseNodeModel';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class ClaseNodeFactory extends AbstractReactFactory {
  constructor() {
    super('clase');
  }

  generateReactWidget(event) {
    return <ClaseNodeWidget engine={this.engine} node={event.model} />;
  }

  generateModel(event) {
    return new ClaseNodeModel();
  }
}