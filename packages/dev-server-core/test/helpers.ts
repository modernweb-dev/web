import path from 'path';
import {
  createTestServer as originalCreateTestServer,
  timeout,
  fetchText,
  expectIncludes,
  virtualFilesPlugin,
} from '../dist/test-helpers.js';
import type { DevServerCoreConfig } from '../dist/server/DevServerCoreConfig.js';

export function createTestServer(config: Partial<DevServerCoreConfig> = {}) {
  return originalCreateTestServer({
    rootDir: path.resolve(import.meta.dirname, 'fixtures', 'basic'),
    ...config,
  });
}

export { timeout, fetchText, expectIncludes, virtualFilesPlugin };
