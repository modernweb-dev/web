import path from 'path';
import {
  createTestServer as originalCreateTestServer,
  timeout,
  fetchText,
  expectIncludes,
  virtualFilesPlugin,
} from '../src/test-helpers';
import { DevServerCoreConfig } from '../src/DevServerCoreConfig';

export function createTestServer(config: Partial<DevServerCoreConfig> = {}) {
  return originalCreateTestServer({
    ...config,
    rootDir: path.resolve(__dirname, 'fixtures', 'basic'),
  });
}

export { timeout, fetchText, expectIncludes, virtualFilesPlugin };
