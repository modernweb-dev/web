import path from 'path';
import {
  createTestServer as originalCreateTestServer,
  timeout,
  fetchText,
  expectIncludes,
} from '@web/dev-server-core/test-helpers';
<<<<<<< HEAD
import { DevServerCoreConfig, Logger } from '@web/dev-server-core';
||||||| parent of aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)
import type { DevServerCoreConfig, Logger } from '@web/dev-server-core';

const __dirname = import.meta.dirname;
=======
<<<<<<< HEAD
import type { DevServerCoreConfig, Logger } from '@web/dev-server-core.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import type { DevServerCoreConfig, Logger } from '@web/dev-server-core.ts';
=======
import type { DevServerCoreConfig, Logger } from '@web/dev-server-core';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)

const __dirname = import.meta.dirname;
>>>>>>> aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)

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
