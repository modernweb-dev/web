import { expect } from 'chai';
import portfinder from 'portfinder';

import { DevServer, DevServerCoreConfig, Logger } from '@web/dev-server-core';

import { storybookPlugin } from '../../src/serve/storybookPlugin.js';

const mockLogger: Logger = {
  ...console,
  debug() {
    // no debug
  },
  logSyntaxError(error: Error) {
    console.error(error);
  },
};

const defaultConfig: Omit<DevServerCoreConfig, 'port' | 'rootDir'> = {
  hostname: 'localhost',
  injectWebSocket: true,
  middleware: [],
  plugins: [],
};

async function createTestServer(config: Partial<DevServerCoreConfig>) {
  if (!config.rootDir) {
    throw new Error('A rootDir must be configured.');
  }

  const port = await portfinder.getPortPromise({ port: 9000 });
  const server = new DevServer(
    { ...defaultConfig, ...config, rootDir: config.rootDir, port },
    mockLogger,
  );
  await server.start();
  return { server, port, host: `http://localhost:${port}` };
}

const configDir = './test/fixtures/storybook-config-dir';

describe('dev-server-storybook', () => {
  describe('type=web-components', () => {
    it('will load up a storybook UI', async () => {
      const { server, host } = await createTestServer({
        rootDir: 'foobar',
        plugins: [storybookPlugin({ type: 'web-components', configDir })],
      });

      try {
        const response = await fetch(`${host}/`);
        const body = await response.text();
        expect(body).to.include("import '@web/storybook-prebuilt/manager.js';");
        expect(body).to.include('<title>Storybook</title>');
      } finally {
        server.stop();
      }
    });
  });

  describe('type=preact', () => {
    it('will load a storybook UI', async () => {
      const { server, host } = await createTestServer({
        rootDir: 'foobar',
        plugins: [storybookPlugin({ type: 'preact', configDir })],
      });

      try {
        const response = await fetch(`${host}/`);
        const body = await response.text();
        expect(body).to.include('<title>Storybook</title>');
        expect(body).to.include("import '@web/storybook-prebuilt/manager.js';");
      } finally {
        server.stop();
      }
    });
  });
});
