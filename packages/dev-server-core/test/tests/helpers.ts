import path from 'path';
import {
  createTestServer as originalCreateTestServer,
  timeout,
  fetchText,
  expectIncludes,
} from '../../src/test-helpers';
import { Config } from '../../src/Config';

export function createTestServer(config: Partial<Config> = {}) {
  return originalCreateTestServer({
    ...config,
    rootDir: path.resolve(__dirname, '..', 'fixtures', 'basic'),
  });
}

export { timeout, fetchText, expectIncludes };
