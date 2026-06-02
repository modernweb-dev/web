import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach, before, after, mock } from 'node:test';
import express from 'express';
import http from 'http';
import Koa from 'koa';
import { Server } from 'net';
import portfinder from 'portfinder';
import type { ServerStartParams } from '../../dist/plugins/Plugin.js';
import type { DevServer } from '../../dist/server/DevServer.js';
import { createTestServer } from '../helpers.ts';

describe('basic', () => {
  let host: string;
  let server: DevServer;

  beforeEach(async () => {
    ({ host, server } = await createTestServer());
  });

  afterEach(() => {
    server.stop();
  });

  it('returns static files', async () => {
    const response = await fetch(`${host}/index.html`);
    const responseText = await response.text();

    assert.equal(response.status, 200);
    assert.ok(responseText.includes('<title>My app</title>'));
  });

  it('returns hidden files', async () => {
    const response = await fetch(`${host}/.hidden`);
    const responseText = await response.text();

    assert.equal(response.status, 200);
    assert.ok(responseText.includes('this file is hidden'));
  });

  it('returns files in a folder', async () => {
    const response = await fetch(`${host}/src/hello-world.txt`);
    const responseText = await response.text();

    assert.equal(response.status, 200);
    assert.equal(responseText, 'Hello world!');
  });

  it('returns a 404 for unknown files', async () => {
    const response = await fetch(`${host}/non-existing.js`);

    assert.equal(response.status, 404);
  });

  it('sets no-cache header', async () => {
    const response = await fetch(`${host}/index.html`);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-cache');
  });
});

it('can configure the hostname', async () => {
  const { server, host } = await createTestServer({ hostname: 'localhost' });
  const response = await fetch(`${host}/index.html`);
  const responseText = await response.text();

  assert.equal(response.status, 200);
  assert.ok(responseText.includes('<title>My app</title>'));
  server.stop();
});

describe('http2', () => {
  before(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  });

  after(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  });

  it('serves a website', async () => {
    const { server, host } = await createTestServer({ hostname: 'localhost', http2: true });
    const response = await fetch(`${host}/index.html`);
    const responseText = await response.text();

    assert.equal(response.status, 200);
    assert.ok(responseText.includes('<title>My app</title>'));
    server.stop();
  });
});

it('can run in middleware mode', async () => {
  const { server: wdsServer } = await createTestServer({ middlewareMode: true });
  assert.equal(wdsServer.server, undefined);

  const app = express();
  let httpServer: http.Server;
  const port = await portfinder.getPortPromise({ port: 9000 });
  await new Promise(
    resolve =>
      (httpServer = app.listen(port, 'localhost', () => {
        resolve(undefined);
      })),
  );
  app.use(wdsServer.koaApp.callback());

  const response = await fetch(`http://localhost:${port}/index.html`);
  const responseText = await response.text();

  assert.equal(response.status, 200);
  assert.ok(responseText.includes('<title>My app</title>'));

  httpServer!.close();
});

it('can run multiple servers in parallel', async () => {
  const results = [
    await createTestServer(),
    await createTestServer(),
    await createTestServer(),
    await createTestServer(),
    await createTestServer(),
  ];

  for (const result of results) {
    const response = await fetch(`${result.host}/index.html`);
    const responseText = await response.text();

    assert.equal(response.status, 200);
    assert.ok(responseText.includes('<title>My app</title>'));
    result.server.stop();
  }
});

it('can add extra middleware', async () => {
  const { server, host } = await createTestServer({
    middleware: [
      async ctx => {
        if (ctx.path === '/foo') {
          ctx.body = 'response from middleware';
          return;
        }
      },
    ],
  });

  const response = await fetch(`${host}/foo`);
  const responseText = await response.text();

  assert.equal(response.status, 200);
  assert.ok(responseText.includes('response from middleware'));
  server.stop();
});

it('calls serverStart on plugin hook on start', async () => {
  let startArgs: ServerStartParams;
  const { server } = await createTestServer({
    plugins: [
      {
        name: 'test',
        serverStart(args) {
          startArgs = args;
        },
      },
    ],
  });

  assert.ok(startArgs!);
  assert.ok(startArgs!.app instanceof Koa);
  assert.ok(startArgs!.server instanceof Server);
  assert.equal(startArgs!.fileWatcher.constructor.name, 'FSWatcher');
  assert.equal(typeof startArgs!.config, 'object');

  server.stop();
});

it('calls serverStop on plugin hook on stop', async () => {
  let stopCalled = false;
  const { server } = await createTestServer({
    plugins: [
      {
        name: 'test',
        serverStop() {
          stopCalled = true;
        },
      },
    ],
  });

  await server.stop();
  assert.equal(stopCalled, true);
});

it('waits on server start hooks before starting', async () => {
  let aFinished = false;
  let bFinished = false;

  const { server } = await createTestServer({
    plugins: [
      {
        name: 'test-a',
        serverStart() {
          return new Promise<void>(resolve =>
            setTimeout(() => {
              aFinished = true;
              resolve();
            }, 5),
          );
        },
      },
      {
        name: 'test-b',
        serverStart() {
          return new Promise<void>(resolve =>
            setTimeout(() => {
              bFinished = true;
              resolve();
            }, 10),
          );
        },
      },
    ],
  });

  assert.equal(aFinished, true);
  assert.equal(bFinished, true);
  server.stop();
});

describe('disableFileWatcher', () => {
  const setupDisableFileWatch = async (config: { disableFileWatcher: boolean }) => {
    let addMock: ReturnType<typeof mock.method> | undefined;
    const { host, server } = await createTestServer({
      disableFileWatcher: config.disableFileWatcher,
      plugins: [
        {
          name: 'watcher-stub',
          serverStart({ fileWatcher }) {
            addMock = mock.method(fileWatcher, 'add');
          },
        },
      ],
    });
    if (!addMock) {
      throw new Error('Something went wrong with mocking the file watcher');
    }

    await fetch(`${host}/index.html`);

    return { addMock, host, server };
  };

  it('disables file watch when true', async () => {
    const { addMock, server } = await setupDisableFileWatch({ disableFileWatcher: true });

    assert.equal(addMock.mock.callCount(), 0);
    server.stop();
  });

  it('leaves file watch in tact when false', async () => {
    const { addMock, server } = await setupDisableFileWatch({ disableFileWatcher: false });

    assert.ok(addMock.mock.callCount() > 0);
    server.stop();
  });
});
