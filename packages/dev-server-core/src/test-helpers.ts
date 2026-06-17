import portfinder from 'portfinder';
import { green, red, yellow } from 'nanocolors';

import { DevServer } from './server/DevServer.js';
import { DevServerCoreConfig } from './server/DevServerCoreConfig.js';
import { Logger } from './logger/Logger.js';
import { Plugin } from './plugins/Plugin.js';

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

export function virtualFilesPlugin(servedFiles: Record<string, string>): Plugin {
  return {
    name: 'test-helpers-virtual-files',
    serve(context) {
      if (context.path in servedFiles) {
        return servedFiles[context.path];
      }
    },
  };
}

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

export const timeout = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchText(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export function expectIncludes(text: string, expected: string) {
  if (!text.includes(expected)) {
    throw new Error(red(`Expected "${yellow(expected)}" in string: \n\n${green(text)}`));
  }
}

export function expectNotIncludes(text: string, expected: string) {
  if (text.includes(expected)) {
    throw new Error(`Did not expect "${expected}" in string: \n\n${text}`);
  }
}
