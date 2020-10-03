import Koa from 'koa';
import { Server } from 'net';
import { FSWatcher } from 'chokidar';
import { expect } from 'chai';
import fetch from 'node-fetch';
import { ServerStartParams } from '../../src/Plugin';
import { DevServer } from '../../src/server/DevServer';
import { createTestServer } from '../helpers';

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

    expect(response.status).to.equal(200);
    expect(responseText).to.include('<title>My app</title>');
  });

  it('returns hidden files', async () => {
    const response = await fetch(`${host}/.hidden`);
    const responseText = await response.text();

    expect(response.status).to.equal(200);
    expect(responseText).to.include('this file is hidden');
  });

  it('returns files in a folder', async () => {
    const response = await fetch(`${host}/src/hello-world.txt`);
    const responseText = await response.text();

    expect(response.status).to.equal(200);
    expect(responseText).to.equal('Hello world!');
  });

  it('returns a 404 for unknown files', async () => {
    const response = await fetch(`${host}/non-existing.js`);

    expect(response.status).to.equal(404);
  });

  it('sets no-cache header', async () => {
    const response = await fetch(`${host}/index.html`);

    expect(response.status).to.equal(200);
    expect(response.headers.get('cache-control')).to.equal('no-cache');
  });
});

it('can configure the hostname', async () => {
  const { server, host } = await createTestServer({ hostname: '0.0.0.0' });
  const response = await fetch(`${host}/index.html`);
  const responseText = await response.text();

  expect(response.status).to.equal(200);
  expect(responseText).to.include('<title>My app</title>');
  server.stop();
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

    expect(response.status).to.equal(200);
    expect(responseText).to.include('<title>My app</title>');
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

  expect(response.status).to.equal(200);
  expect(responseText).to.include('response from middleware');
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

  expect(startArgs!).to.exist;
  expect(startArgs!.app).to.be.an.instanceOf(Koa);
  expect(startArgs!.server).to.be.an.instanceOf(Server);
  expect(startArgs!.fileWatcher).to.be.an.instanceOf(FSWatcher);
  expect(startArgs!.config).to.be.an('object');

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
  expect(stopCalled).to.be.true;
});

it('waits on server start hooks before starting', async () => {
  let aFinished = false;
  let bFinished = false;

  const { server } = await createTestServer({
    plugins: [
      {
        name: 'test-a',
        serverStart() {
          return new Promise(resolve =>
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
          return new Promise(resolve =>
            setTimeout(() => {
              bFinished = true;
              resolve();
            }, 10),
          );
        },
      },
    ],
  });

  expect(aFinished).to.be.true;
  expect(bFinished).to.be.true;
  server.stop();
});
