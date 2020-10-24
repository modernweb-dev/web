import { expect } from 'chai';
import { Context } from 'koa';
import fetch from 'node-fetch';
import * as sinon from 'sinon';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { hmrPlugin } from '../src/index';
import { NAME_HMR_CLIENT_IMPORT } from '../src/HmrPlugin';

const mockFile = (path: string, source: string) => ({
  name: `test-file:${path}`,
  serve: (context: Context) => {
    if (context.path === path) {
      return source;
    }
  }
});

describe('HmrPlugin', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should emit reload for untracked files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        mockFile('/foo.js', `
          import.meta.hot.accept(() => {});
        `),
        hmrPlugin()
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = sinon.stub(webSockets, 'send');
    try {
      await fetch(`${host}/foo.js`);
      fileWatcher.emit('change', '/foo.js');

      expect(stub.firstCall.args[0]).to.equal(JSON.stringify({
        type: 'hmr:update',
        url: '/foo.js'
      }));
    } finally {
      await server.stop();
    }
  });

  it('should emit update for tracked files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        mockFile('/foo.js', `
          export const foo = 5;
        `),
        hmrPlugin()
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = sinon.stub(webSockets, 'send');
    try {
      await fetch(`${host}/foo.js`);
      fileWatcher.emit('change', '/foo.js');

      expect(stub.firstCall.args[0]).to.equal(JSON.stringify({
        type: 'hmr:reload'
      }));
    } finally {
      await server.stop();
    }
  });

  it('serves a hmr client', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        hmrPlugin()
      ],
    });

    try {
      const response = await fetch(`${host}${NAME_HMR_CLIENT_IMPORT}`);
      const body = await response.text();
      expect(body.includes('class HotModule')).to.equal(true);
    } finally {
      await server.stop();
    }
  });

  it('transforms hmr-capable js files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        mockFile('/foo.js', `
          import.meta.hot.accept(() => {});
        `),
        hmrPlugin()
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const body = await response.text();

      expect(body.includes('__WDS_HMR__')).to.equal(true);
    } finally {
      await server.stop();
    }
  });

  it('does not transform non-hmr js files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        mockFile('/foo.js', `export const foo = 5;`),
        hmrPlugin()
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const body = await response.text();

      expect(body.includes('__WDS_HMR__')).to.equal(false);
    } finally {
      await server.stop();
    }
  });
});
