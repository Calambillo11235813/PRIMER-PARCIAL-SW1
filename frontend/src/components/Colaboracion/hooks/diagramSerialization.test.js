import * as ds from '../../EditorVisual/utils_1/diagramSerialization';

test('diagramSerialization: roundtrip serialize/deserialize', () => {
  const diagram = {
    nodos: [{ id: 'n1', tipo: 'clase', nombre: 'Clase1', x: 10, y: 20 }],
    relaciones: []
  };

  const serialize = ds.serializeDiagram || ds.serialize || ((d) => JSON.stringify(d));
  const deserialize = ds.deserializeDiagram || ds.deserialize || ((s) => JSON.parse(s));

  const payload = serialize(diagram);
  const result = deserialize(payload);

  expect(result).toEqual(diagram);
});