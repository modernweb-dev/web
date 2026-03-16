import path from 'path';
import {
  createTestServer as originalCreateTestServer,
  timeout,
  fetchText,
  expectIncludes,
  virtualFilesPlugin,
<<<<<<< HEAD
} from '../src/test-helpers.js';
import { DevServerCoreConfig } from '../src/server/DevServerCoreConfig.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
} from '../src/test-helpers.ts';
import { DevServerCoreConfig } from '../src/server/DevServerCoreConfig.ts';
=======
<<<<<<< HEAD
} from '../src/test-helpers.ts';
import { DevServerCoreConfig } from '../src/server/DevServerCoreConfig.ts';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
} from '../src/test-helpers.js';
import { DevServerCoreConfig } from '../src/server/DevServerCoreConfig.js';
=======
} from '../src/test-helpers.ts';
import type { DevServerCoreConfig } from '../src/server/DevServerCoreConfig.ts';

const __dirname = import.meta.dirname;
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)

export function createTestServer(config: Partial<DevServerCoreConfig> = {}) {
  return originalCreateTestServer({
    rootDir: path.resolve(__dirname, 'fixtures', 'basic'),
    ...config,
  });
}

export { timeout, fetchText, expectIncludes, virtualFilesPlugin };
