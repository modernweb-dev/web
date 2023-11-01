import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from 'chai';

import { DevServer } from '../../src/server/DevServer';
import { createTestServer } from '../helpers';

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

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
    });

    it('can request without base path', async () => {
      const response = await fetch(`${host}/index.html`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
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

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
    });

    it('can request without base path', async () => {
      const response = await fetch(`${host}/index.html`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
    });
  });
});
