import type { DevServerCoreConfig, Logger } from '@web/dev-server-core';
import {
  expectIncludes,
  fetchText,
  createTestServer as originalCreateTestServer,
  timeout,
} from '@web/dev-server-core/test-helpers';
import path from 'path';

export function createTestServer(config: Partial<DevServerCoreConfig> = {}, mockLogger?: Logger) {
  return originalCreateTestServer(
    {
      rootDir: path.resolve(import.meta.dirname, 'fixtures', 'basic'),
      ...config,
    },
    mockLogger,
  );
}

export { timeout, fetchText, expectIncludes };
