import { CoverageConfig } from '@web/test-runner-core';
import { Plugin, getRequestFilePath } from '@web/dev-server-core';
import { transformAsync } from '@babel/core';
import picoMatch from 'picomatch';
import path from 'path';
import { TEST_FRAMEWORK_PATH } from './serveTestFrameworkPlugin';

export function testCoveragePlugin(testFiles: string[], coverageConfig?: CoverageConfig): Plugin {
  const resolvedTestFiles = testFiles.map(f => path.resolve(f));
  const exclude = (coverageConfig?.exclude ?? []).map(p => picoMatch(p));
  const include = (coverageConfig!.include ?? []).map(p => picoMatch(p));

  let rootDir: string;

  return {
    name: 'web-test-runner-coverage',

    serverStart({ config }) {
      ({ rootDir } = config);
    },

    async transform(context) {
      if (!context.response.is('.js')) {
        return;
      }

      if (context.path === TEST_FRAMEWORK_PATH) {
        return;
      }

      const filePath = getRequestFilePath(context, rootDir);
      if (resolvedTestFiles.includes(filePath)) {
        return;
      }

      if (include.length > 0 && !include.some(m => m(filePath))) {
        return;
      }

      if (exclude.length > 0 && exclude.some(m => m(filePath))) {
        return;
      }
      const transformed = await transformAsync(context.body, {
        caller: {
          name: '@web/test-runner-server',
          supportsStaticESM: true,
        },
        filename: filePath,
        sourceType: 'module',
        configFile: false,
        babelrc: false,
        plugins: [
          require.resolve('babel-plugin-istanbul'),
          require.resolve('@babel/plugin-syntax-dynamic-import'),
          require.resolve('@babel/plugin-syntax-import-meta'),
          require.resolve('@babel/plugin-syntax-class-properties'),
          require.resolve('@babel/plugin-syntax-numeric-separator'),
          require.resolve('@babel/plugin-syntax-top-level-await'),
          require.resolve('@babel/plugin-syntax-logical-assignment-operators'),
          require.resolve('@babel/plugin-syntax-export-default-from'),
        ],
      });

      return transformed?.code ?? undefined;
    },
  };
}
