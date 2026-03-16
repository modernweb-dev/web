import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { DevServer } from '../../src/server/DevServer.ts';
import { createTestServer } from '../helpers.ts';

describe('base path middleware', () => {
  describe('without a trailing /', () => {
    let host: string;
    let server: DevServer;
    beforeEach(async () => {
      ({ server, host } = await createTestServer({ basePath: '/foo' }));
    });

    afterEach(() => {
      server.stop();
    });

    it('strips the base path from requests', async () => {
      const response = await fetch(`${host}/foo/index.html`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes('<title>My app</title>'));
    });

    it('can request without base path', async () => {
      const response = await fetch(`${host}/index.html`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes('<title>My app</title>'));
    });
  });

  describe('with a trailing /', () => {
    let host: string;
    let server: DevServer;
    beforeEach(async () => {
      ({ server, host } = await createTestServer({ basePath: '/foo/' }));
    });

    afterEach(() => {
      server.stop();
    });

    it('strips the base path from requests', async () => {
      const response = await fetch(`${host}/foo/index.html`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes('<title>My app</title>'));
    });

    it('can request without base path', async () => {
      const response = await fetch(`${host}/index.html`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes('<title>My app</title>'));
    });
  });
});
