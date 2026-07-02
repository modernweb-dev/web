import path from 'path';
import type { DevServerCoreConfig } from '../dist/server/DevServerCoreConfig.js';
import {
  expectIncludes,
  expectNotIncludes,
  fetchText,
  createTestServer as originalCreateTestServer,
  timeout,
  virtualFilesPlugin,
} from '../dist/test-helpers.js';

export function createTestServer(config: Partial<DevServerCoreConfig> = {}) {
  return originalCreateTestServer({
    rootDir: path.resolve(import.meta.dirname, 'fixtures', 'basic'),
    ...config,
  });
}

export { timeout, fetchText, expectIncludes, expectNotIncludes, virtualFilesPlugin };
