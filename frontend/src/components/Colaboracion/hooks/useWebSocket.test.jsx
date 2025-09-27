import React, { useEffect } from 'react';
import { render, act } from '@testing-library/react';
import * as hookModule from './useWebSocket';

// resolver export del hook (soporta default o named export)
const useWebSocket = (typeof hookModule === 'function')
  ? hookModule
  : (hookModule.default || hookModule.useWebSocket || hookModule);

class MockWebSocket {
  constructor(url) {
    MockWebSocket.instances.push(this);
    this.url = url;
    this.sent = [];
    this.onopen = null;
    setTimeout(() => this.onopen && this.onopen({}), 0);
  }
  send(data) { this.sent.push(data); }
  close() { this.closed = true; }
  static instances = [];
}

beforeAll(() => { global.WebSocket = MockWebSocket; });
afterEach(() => { MockWebSocket.instances = []; });

function HookWrapper({ diagramaId, token, storeRef }) {
  const api = useWebSocket({ diagramaId, token });
  useEffect(() => { if (storeRef) storeRef.current = api; }, [api, storeRef]);
  return null;
}

test('useWebSocket crea conexión y puede enviar mensajes', async () => {
  const token = 'test-token';
  const diagramaId = 4;
  const storeRef = { current: null };

  // envolver render y la espera del onopen dentro de act(async) para evitar la advertencia
  await act(async () => {
    localStorage.setItem('access_token', token);
    render(<HookWrapper diagramaId={diagramaId} token={token} storeRef={storeRef} />);
    // esperar la apertura simulada del MockWebSocket
    await new Promise((r) => setTimeout(r, 20));
  });

  expect(MockWebSocket.instances.length).toBe(1);
  const created = MockWebSocket.instances[0];
  expect(created.url).toContain(`/ws/diagrama/${diagramaId}`);

  if (storeRef.current && typeof storeRef.current.sendMessage === 'function') {
    await act(async () => { storeRef.current.sendMessage({ tipo: 'ping' }); });
    expect(created.sent.length).toBeGreaterThanOrEqual(1);
  }

  // cleanup
  localStorage.removeItem('access_token');
});