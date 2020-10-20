import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Plugin } from '@web/dev-server-core';
import { TestFramework } from '../../test-framework/TestFramework';

const TEST_FRAMEWORK_IMPORT_ROOT = '/__web-test-runner__/test-framework/';
const REGEXP_SOURCE_MAP = /\/\/# sourceMappingURL=.*/;

async function readFile(codePath: string) {
  if (!fs.existsSync(codePath)) {
    throw new Error(
      `The test framework at ${codePath} could not be loaded. ` +
        'Are your dependencies installed correctly? Is there a server plugin or middleware that interferes?',
    );
  }

  return (await promisify(fs.readFile)(codePath, 'utf-8')).replace(REGEXP_SOURCE_MAP, '');
}

/**
 * Serves test framework without requiring the files to be available within the root dir of the project.
 */
export function serveTestFrameworkPlugin(testFramework: TestFramework) {
  const testFrameworkFilePath = path.resolve(testFramework.path);
  const testeFrameworkBrowserPath = testFrameworkFilePath.split(path.sep).join('/');
  const testFrameworkImport = encodeURI(
    path.posix.join(TEST_FRAMEWORK_IMPORT_ROOT, testeFrameworkBrowserPath),
  );

  const testFrameworkPlugin: Plugin = {
    name: 'wtr-serve-test-framework',

    async serve(context) {
      if (context.path.startsWith(TEST_FRAMEWORK_IMPORT_ROOT)) {
        const importPath = decodeURI(context.path.replace(TEST_FRAMEWORK_IMPORT_ROOT, ''));
        let filePath = importPath.split('/').join(path.sep);
        // for posix the leading / will be stripped by path.join above
        if (path.sep === '/') {
          filePath = `/${filePath}`;
        }
        const body = await readFile(filePath);
        return { body, type: 'js', headers: { 'cache-control': 'public, max-age=31536000' } };
      }
    },
  };

  return { testFrameworkImport, testFrameworkPlugin };
}
