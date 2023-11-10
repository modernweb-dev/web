import { expect } from 'chai';

import { DevServer } from '../../src/server/DevServer.js';
import { createTestServer } from '../helpers.js';

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

  context('with a trailing /', () => {
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
