import fs from 'fs';
import { resolve } from 'path';
import { Plugin } from '@web/dev-server-core';
import { TestFramework } from '@web/test-runner-core';

export const TEST_FRAMEWORK_PATH = '/__web-test-runner__/test-framework.js';
const REGEXP_SOURCE_MAP = /\/\/# sourceMappingURL=.*/;

function readTestFramework(testFramework: TestFramework) {
  const codePath = resolve(testFramework.path);
  if (!fs.existsSync(codePath)) {
    throw new Error(`Could not find a test framework at ${codePath}`);
  }

  const code = fs.readFileSync(codePath, 'utf-8').replace(REGEXP_SOURCE_MAP, '');
  return code;
}

export function serveTestFrameworkPlugin(testFramework: TestFramework): Plugin {
  const code = readTestFramework(testFramework);

  return {
    name: 'wtr-serve-test-framework',

    serve(context) {
      if (context.path === TEST_FRAMEWORK_PATH) {
        return {
          body: code,
          type: 'js',
          headers: { 'cache-control': 'public, max-age=31536000' },
        };
      }
    },
  };
}
