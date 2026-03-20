import path from 'path';
import {
  createTestServer as originalCreateTestServer,
  timeout,
  fetchText,
  expectIncludes,
} from '@web/dev-server-core/test-helpers';
import { DevServerCoreConfig, Logger } from '@web/dev-server-core';

export function createTestServer(config: Partial<DevServerCoreConfig> = {}, mockLogger?: Logger) {
  return originalCreateTestServer(
    {
      rootDir: path.resolve(__dirname, 'fixtures', 'basic'),
      ...config,
    },
    mockLogger,
  );
}

export { timeout, fetchText, expectIncludes };
