import path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

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
