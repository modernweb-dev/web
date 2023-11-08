import { expect } from 'chai';

import { createTestServer } from '../helpers.js';
import { webSocketScript } from '../../src/web-sockets/webSocketsPlugin.js';

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

      expect(response.status).to.equal(200);
      expect(body).to.include(webSocketScript);
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

      expect(response.status).to.equal(200);
      expect(body).to.not.include(webSocketScript);
    } finally {
      server.stop();
    }
  });

  it('does not inject event stream script is no plugin has inject set', async () => {
    const { server, host } = await createTestServer();
    try {
      const response = await fetch(`${host}/index.html`);
      const body = await response.text();

      expect(response.status).to.equal(200);
      expect(body).to.not.include(webSocketScript);
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

      expect(responseA.status).to.equal(200);
      expect(responseB.status).to.equal(200);
      expect(bodyA).to.not.include(webSocketScript);
      expect(bodyB).to.not.include(webSocketScript);
    } finally {
      server.stop();
    }
  });
});
