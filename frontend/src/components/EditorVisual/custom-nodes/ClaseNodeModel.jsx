import { DefaultNodeModel, DefaultPortModel } from '@projectstorm/react-diagrams';

export class ClaseNodeModel extends DefaultNodeModel {
  constructor(options = {}) {
    super({
      ...options,
      type: 'clase',
      color: 'green'
    });

    // Crea los ports correctamente
    this.addPort(new DefaultPortModel({
      in: true,
      name: 'in'
    }));
    this.addPort(new DefaultPortModel({
      in: false,
      name: 'out'
    }));
  }
}