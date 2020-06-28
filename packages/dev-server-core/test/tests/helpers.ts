import portfinder from 'portfinder';
import path from 'path';
import { DevServer } from '../../src/server/DevServer';
import { Config } from '../../src/Config';

const defaultConfig: Omit<Config, 'port'> = {
  rootDir: path.resolve(__dirname, '..', 'fixtures', 'basic'),
  hostname: 'localhost',
  middleware: [],
  plugins: [],
};

const mockLogger = {
  log() {
    //
  },
  debug() {
    //
  },
  error() {
    //
  },
  warn() {
    //
  },
  logSyntaxError() {
    //
  },
};

export async function createTestServer(config?: Partial<Config>) {
  const port = await portfinder.getPortPromise();
  const server = new DevServer({ ...defaultConfig, ...config, port }, mockLogger);
  await server.start();
  return { server, port, host: `http://localhost:${port}` };
}

export const timeout = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
