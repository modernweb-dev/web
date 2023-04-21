import path from 'path';
import {
  createTestServer as originalCreateTestServer,
  timeout,
  fetchText,
  expectIncludes,
  virtualFilesPlugin,
} from '../src/test-helpers';
import { DevServerCoreConfig } from '../src/server/DevServerCoreConfig';

export function createTestServer(config: Partial<DevServerCoreConfig> = {}) {
  return originalCreateTestServer({
    rootDir: path.resolve(__dirname, 'fixtures', 'basic'),
    ...config,
  });
}

export { timeout, fetchText, expectIncludes, virtualFilesPlugin };
