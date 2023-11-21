import * as path from 'path';
import {
  createTestServer as originalCreateTestServer,
  timeout,
  fetchText,
  expectIncludes,
} from '@web/dev-server-core/dist/test-helpers.js';
import { DevServerCoreConfig, Logger } from '@web/dev-server-core';
import { fileURLToPath } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));

export function createTestServer(config: Partial<DevServerCoreConfig> = {}, mockLogger?: Logger) {
  return originalCreateTestServer(
    {
      rootDir: path.resolve(dirname, 'fixtures', 'basic'),
      ...config,
    },
    mockLogger,
  );
}

export { timeout, fetchText, expectIncludes };
