import fs from 'fs';
import { Plugin } from '@web/dev-server-core';

export const TEST_FRAMEWORK_PATH = '/__web-test-runner__/test-framework.js';
const REGEXP_SOURCE_MAP = /\/\/# sourceMappingURL=.*/;

function loadTestFrameworkCode(testFramework: string) {
  try {
    const testFrameworkFilepath = require.resolve(testFramework, {
      paths: [__dirname, process.cwd()],
    });

    return fs.readFileSync(testFrameworkFilepath, 'utf-8').replace(REGEXP_SOURCE_MAP, '');
  } catch (error) {
    throw new Error(
      `Could not find test framework "${testFramework}". Did you install this package?`,
    );
  }
}

export function serveTestFrameworkPlugin(testFramework: string): Plugin {
  const testFrameworkCode = loadTestFrameworkCode(testFramework);

  return {
    name: 'wtr-serve-test-framework',

    serve(context) {
      if (context.path === TEST_FRAMEWORK_PATH) {
        return {
          body: testFrameworkCode,
          type: 'js',
          headers: { 'cache-control': 'public, max-age=31536000' },
        };
      }
    },
  };
}
