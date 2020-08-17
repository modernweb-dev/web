import portfinder from 'portfinder';
import { expect } from 'chai';
import chalk from 'chalk';
import fetch, { RequestInit } from 'node-fetch';

import { DevServer } from './server/DevServer';
import { DevServerCoreConfig } from './DevServerCoreConfig';
import { Logger } from './logger/Logger';
import { Plugin } from './Plugin';

const defaultConfig: Omit<DevServerCoreConfig, 'port' | 'rootDir'> = {
  hostname: 'localhost',
  middleware: [],
  plugins: [],
};

const mockLogger: Logger = {
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
  return { server, port, host: `http://localhost:${port}` };
}

export const timeout = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchText(url: string, init?: RequestInit) {
  const response = await fetch(url, init);

  expect(response.status).to.equal(200);
  return response.text();
}

export function expectIncludes(text: string, expected: string) {
  if (!text.includes(expected)) {
    throw new Error(
      chalk.red(`Expected "${chalk.yellow(expected)}" in string: \n\n${chalk.green(text)}`),
    );
  }
}

export function expectNotIncludes(text: string, expected: string) {
  if (text.includes(expected)) {
    throw new Error(`Did not expect "${expected}" in string: \n\n${text}`);
  }
}
