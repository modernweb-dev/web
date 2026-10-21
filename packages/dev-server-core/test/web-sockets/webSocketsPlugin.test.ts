import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes, assertNotIncludes } from '../../../../test-helpers/node.js';
import { NAME_WEB_SOCKET_IMPORT } from '../../dist/web-sockets/WebSocketsManager.js';
import { webSocketScript } from '../../dist/web-sockets/webSocketsPlugin.js';
import { createTestServer } from '../helpers.ts';

describe('webSocketsPlugin', () => {
  it('injects an event stream script if a plugin has inject set and event stream is enabled', async () => {
    const { server, host } = await createTestServer({
      injectWebSocket: true,
      plugins: [
        {
          name: 'test',
          injectWebSocket: true,
        },
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);
      const body = await response.text();

      assert.equal(response.status, 200);
      assertIncludes(body, webSocketScript);
    } finally {
      server.stop();
    }
  });

  it('does not inject an event stream script if a plugin has inject set and event stream is disabled', async () => {
    const { server, host } = await createTestServer({
      injectWebSocket: false,
      plugins: [
        {
          name: 'test',
          injectWebSocket: true,
        },
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);
      const body = await response.text();

      assert.equal(response.status, 200);
      assertNotIncludes(body, webSocketScript);
    } finally {
      server.stop();
    }
  });

  it('does not inject event stream script is no plugin has inject set', async () => {
    const { server, host } = await createTestServer();
    try {
      const response = await fetch(`${host}/index.html`);
      const body = await response.text();

      assert.equal(response.status, 200);
      assertNotIncludes(body, webSocketScript);
    } finally {
      server.stop();
    }
  });

  it('does not inject event stream script into html fragments without html or body', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          injectWebSocket: true,
        },
      ],
    });

    try {
      const responseA = await fetch(`${host}/html-fragment-a.html`);
      const responseB = await fetch(`${host}/html-fragment-b.html`);
      const bodyA = await responseA.text();
      const bodyB = await responseB.text();

      assert.equal(responseA.status, 200);
      assert.equal(responseB.status, 200);
      assertNotIncludes(bodyA, webSocketScript);
      assertNotIncludes(bodyB, webSocketScript);
    } finally {
      server.stop();
    }
  });

  it('rejects a message when the websocket closes before opening', async () => {
    const { server, host } = await createTestServer({
      injectWebSocket: true,
      plugins: [{ name: 'test', injectWebSocket: true }],
    });
    const originalGlobals = new Map(
      ['window', 'navigator', 'WebSocket'].map(name => [
        name,
        Object.getOwnPropertyDescriptor(globalThis, name),
      ]),
    );

    try {
      const response = await fetch(`${host}${NAME_WEB_SOCKET_IMPORT}`);
      assert.equal(response.status, 200);
      const source = await response.text();
      const fakeWindow = new EventTarget();
      Reflect.set(fakeWindow, 'parent', fakeWindow);

      class FakeWebSocket extends EventTarget {
        send() {}
      }

      Reflect.set(fakeWindow, 'WebSocket', FakeWebSocket);
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: fakeWindow,
      });
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: { userAgent: '' },
      });
      Object.defineProperty(globalThis, 'WebSocket', {
        configurable: true,
        value: FakeWebSocket,
      });

      const client = await import(
        `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
      );
      const pendingMessage = client.sendMessage({ type: 'wtr-session-started' });
      const messageOutcome = pendingMessage.then(
        () => ({ type: 'resolved' as const }),
        error => ({ type: 'rejected' as const, error }),
      );

      client.webSocket.dispatchEvent(new Event('close'));
      const outcome = await Promise.race([
        messageOutcome,
        new Promise<{ type: 'timeout' }>(resolve => {
          setTimeout(() => resolve({ type: 'timeout' }), 100);
        }),
      ]);

      assert.equal(outcome.type, 'rejected');
      if (outcome.type === 'rejected') {
        assert.match(outcome.error.message, /WebSocket connection failed before opening/);
      }
    } finally {
      originalGlobals.forEach((descriptor, name) => {
        if (descriptor) {
          Object.defineProperty(globalThis, name, descriptor);
        } else {
          Reflect.deleteProperty(globalThis, name);
        }
      });
      server.stop();
    }
  });
});
