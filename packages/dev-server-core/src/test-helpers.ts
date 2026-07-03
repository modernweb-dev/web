import portfinder from 'portfinder';

import { Logger } from './logger/Logger.js';
import { DevServer } from './server/DevServer.js';
import { DevServerCoreConfig } from './server/DevServerCoreConfig.js';

const defaultConfig: Omit<DevServerCoreConfig, 'port' | 'rootDir'> = {
  hostname: 'localhost',
  injectWebSocket: true,
  middleware: [],
  plugins: [],
};

const mockLogger: Logger = {
  ...console,
  debug() {
    // no debug
  },
  logSyntaxError(error) {
    console.error(error);
  },
};

export async function createTestServer(
  config: Partial<DevServerCoreConfig>,
  _mockLogger = mockLogger,
) {
  if (!config.rootDir) {
    throw new Error('A rootDir must be configured.');
  }

  const port = await portfinder.getPortPromise({
    port: 9000 + Math.floor(Math.random() * 1000),
  });
  const server = new DevServer(
    { ...defaultConfig, ...config, rootDir: config.rootDir, port },
    _mockLogger,
  );
  await server.start();

  const url = new URL('http://localhost');
  url.protocol = config.http2 ? 'https' : 'http';
  url.port = port.toString();
  return { server, port, host: url.toString().slice(0, -1) };
}
