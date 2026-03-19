import { expect } from 'chai';
import path from 'path';

import { createTestServer } from '../helpers.js';
import { DevServer } from '../../src/server/DevServer.js';

describe('history api fallback middleware', () => {
  describe('index in root', () => {
    let host: string;
    let server: DevServer;

    beforeEach(async () => {
      ({ host, server } = await createTestServer({
        appIndex: path.resolve(__dirname, '..', 'fixtures', 'basic', 'index.html'),
      }));
    });

    afterEach(() => {
      server.stop();
    });

    it('returns the regular index.html', async () => {
      const response = await fetch(`${host}/index.html`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
    });

    it('returns the fallback index.html for non-file requests', async () => {
      const response = await fetch(`${host}/foo`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
    });

    it('returns the fallback index.html for file requests with multiple segments', async () => {
      const response = await fetch(`${host}/foo/bar/baz`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
    });

    it('does not return index.html for file requests', async () => {
      const response = await fetch(`${host}/src/hello-world.txt`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('Hello world!');
      expect(responseText).to.not.include('<title>My app</title>');
    });

    it('does return index.html for requests that have url parameters with . characters (issue 1059)', async () => {
      const response = await fetch(`${host}/text-files/foo/bar/?baz=open.wc`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
    });
  });

  describe('index not in root', () => {
    let host: string;
    let server: DevServer;

    beforeEach(async () => {
      ({ host, server } = await createTestServer({
        appIndex: path.resolve(__dirname, '..', 'fixtures', 'basic', 'src', 'index.html'),
      }));
    });

    afterEach(() => {
      server.stop();
    });

    it('returns the regular index.html', async () => {
      const response = await fetch(`${host}/src/index.html`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app 2</title>');
    });

    it('returns the fallback index.html for non-file requests', async () => {
      const response = await fetch(`${host}/src/foo`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app 2</title>');
    });

    it('returns the fallback index.html for file requests with multiple segments', async () => {
      const response = await fetch(`${host}/src/foo/bar/baz`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app 2</title>');
    });

    it('does not return the index.html for requests outside the index root', async () => {
      const response = await fetch(`${host}/foo`);
      const responseText = await response.text();

      expect(response.status).to.equal(404);
      expect(responseText).to.not.include('<title>My app 2</title>');
    });

    it('does return index.html for requests that have url parameters with . characters (issue 1059)', async () => {
      const response = await fetch(`${host}/src/foo/bar/?baz=open.wc`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app 2</title>');
    });
  });
});
