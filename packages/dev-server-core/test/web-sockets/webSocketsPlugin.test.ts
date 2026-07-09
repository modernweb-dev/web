import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes, assertNotIncludes } from '../../../../test-helpers/node.js';
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
});
