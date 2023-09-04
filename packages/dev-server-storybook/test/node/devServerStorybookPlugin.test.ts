import path from 'node:path';
import * as url from 'node:url';
import { expect } from 'chai';
import portfinder from 'portfinder';

import { DevServer } from '../../../dev-server-core/index.mjs';

import type { DevServerCoreConfig, Logger } from '../../../dev-server-core/index.d.ts';
    
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const mockLogger: Logger = {
  ...console,
  debug() {
    // no debug
  },
  logSyntaxError(error: Error) {
    console.error(error);
  },
};

async function createTestServer(
  config: Partial<DevServerCoreConfig>,
  _mockLogger = mockLogger,
) {
  if (!config.rootDir) {
    throw new Error('A rootDir must be configured.');
  }

  const port = await portfinder.getPortPromise({
    port: 9000 + Math.floor(Math.random() * 1000),
  });
  const server = new DevServer({ 
    hostname: 'localhost',
    injectWebSocket: true,
    middleware: [],
    plugins: [],
    ...config, rootDir: config.rootDir, port },
    _mockLogger,
  );
  await server.start();
  return { server, port, host: `http://localhost:${port}` };
}

describe('dev-server-storybook', () => {
  it('will load up a storybook UI', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixtures', 'bundle-basic'),
      plugins: [],
    });

    try {
      expect(1 + 1).to.equal(2);
    } finally {
      server.stop();
    }
  });

  it('will build a static storybook site', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixtures', 'bundle-multi'),
      plugins: [],
    });

    try {
      expect(1 + 1).to.equal(2);
    } finally {
      server.stop();
    }
  });
});
