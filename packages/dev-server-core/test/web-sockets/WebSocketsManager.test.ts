import { expect } from 'chai';
import WebSocket from 'ws';
import { NAME_WEB_SOCKET_API } from '../../src/web-sockets/WebSocketsManager.js';

import { createTestServer } from '../helpers.js';

function waitFor(fn: (resolve: () => void) => void, msg: string) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(msg));
    }, 1000);

    try {
      fn(() => {
        clearInterval(timeoutId);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

describe('WebSocketManager', () => {
  it('can open a websocket', async () => {
    const { server, port } = await createTestServer({
      injectWebSocket: true,
      plugins: [{ name: 'test', injectWebSocket: true }],
    });
    let ws: WebSocket;

    try {
      ws = new WebSocket(`ws://localhost:${port}/${NAME_WEB_SOCKET_API}`);

      await waitFor(resolve => {
        ws.on('open', resolve);
      }, 'expected web socket to open');
    } finally {
      server.stop();
      ws!.close();
    }
  });

  it('can send a message to an opened socket', async () => {
    const { server, port } = await createTestServer({
      injectWebSocket: true,
      plugins: [{ name: 'test', injectWebSocket: true }],
    });
    let ws: WebSocket;

    try {
      ws = new WebSocket(`ws://localhost:${port}/${NAME_WEB_SOCKET_API}`);
      await waitFor(resolve => {
        ws.on('open', resolve);
      }, 'expected web socket to open');

      const waitForMessage = waitFor(resolve => {
        ws.on('message', data => {
          expect(data).to.equal('hello world');
          resolve();
        });
      }, 'expected a message event');

      server.webSockets!.send('hello world');
      await waitForMessage;
    } finally {
      server.stop();
      ws!.close();
    }
  });

  it('can send a message to multiple browsers', async () => {
    const { server, port } = await createTestServer({
      injectWebSocket: true,
      plugins: [{ name: 'test', injectWebSocket: true }],
    });
    let ws1: WebSocket;
    let ws2: WebSocket;

    try {
      ws1 = new WebSocket(`ws://localhost:${port}/${NAME_WEB_SOCKET_API}`);
      ws2 = new WebSocket(`ws://localhost:${port}/${NAME_WEB_SOCKET_API}`);

      const waitForOpen1 = waitFor(resolve => {
        ws1.on('open', resolve);
      }, 'expected web socket to open');
      const waitForOpen2 = waitFor(resolve => {
        ws2.on('open', resolve);
      }, 'expected web socket to open');
      await Promise.all([waitForOpen1, waitForOpen2]);

      const waitForMessage1 = waitFor(resolve => {
        ws1.on('message', data => {
          expect(data).to.equal('hello world');
          resolve();
        });
      }, 'expected message');
      const waitForMessage2 = waitFor(resolve => {
        ws1.on('message', data => {
          expect(data).to.equal('hello world');
          resolve();
        });
      }, 'expected message');

      server.webSockets!.send('hello world');
      await Promise.all([waitForMessage1, waitForMessage2]);
    } finally {
      server.stop();
      ws1!.close();
      ws2!.close();
    }
  });

  it('fires a message event when receiving a socket message', async () => {
    const { server, port } = await createTestServer({
      injectWebSocket: true,
      plugins: [{ name: 'test', injectWebSocket: true }],
    });
    let ws: WebSocket;

    try {
      ws = new WebSocket(`ws://localhost:${port}/${NAME_WEB_SOCKET_API}`);
      await waitFor(resolve => {
        ws.on('open', resolve);
      }, 'expected web socket to open');

      const waitForMessage = waitFor(resolve => {
        server.webSockets!.on('message', ({ webSocket, data }) => {
          expect(webSocket).to.be.an.instanceOf(WebSocket);
          expect(data).to.eql({ type: 'foo' });
          resolve();
        });
      }, 'expected message event fired from manager');

      ws.send(JSON.stringify({ type: 'foo' }));
      await waitForMessage;
    } finally {
      server.stop();
      ws!.close();
    }
  });

  it('can send a console log', async () => {
    const { server, port } = await createTestServer({
      injectWebSocket: true,
      plugins: [{ name: 'test', injectWebSocket: true }],
    });
    let ws: WebSocket;

    try {
      ws = new WebSocket(`ws://localhost:${port}/${NAME_WEB_SOCKET_API}`);
      await waitFor(resolve => {
        ws.on('open', resolve);
      }, 'expected web socket to open');

      const waitForMessage = waitFor(resolve => {
        ws.on('message', data => {
          const parsedData = JSON.parse(data as any);
          expect(parsedData).to.eql({
            data: {
              args: [],
              importPath: 'data:text/javascript,console.log("hello world");',
            },
            type: 'import',
          });
          resolve();
        });
      }, 'expected a message event');

      server.webSockets!.sendConsoleLog('hello world');
      await waitForMessage;
    } finally {
      server.stop();
      ws!.close();
    }
  });

  it('can send an import', async () => {
    const { server, port } = await createTestServer({
      injectWebSocket: true,
      plugins: [{ name: 'test', injectWebSocket: true }],
    });
    let ws: WebSocket;

    try {
      ws = new WebSocket(`ws://localhost:${port}/${NAME_WEB_SOCKET_API}`);
      await waitFor(resolve => {
        ws.on('open', resolve);
      }, 'expected web socket to open');

      const waitForMessage = waitFor(resolve => {
        ws.on('message', data => {
          const parsedData = JSON.parse(data as any);
          expect(parsedData).to.eql({
            data: {
              args: [],
              importPath: '/foo.js',
            },
            type: 'import',
          });
          resolve();
        });
      }, 'expected a message event');

      server.webSockets!.sendImport('/foo.js');
      await waitForMessage;
    } finally {
      server.stop();
      ws!.close();
    }
  });
});
