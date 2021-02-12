import { fromRollup } from '@web/dev-server-rollup';
import * as babelModule from '@rollup/plugin-babel';

const babel = fromRollup(babelModule.babel);

export default /** @type {import('@web/test-runner').TestRunnerConfig} */ ({
  nodeResolve: true,
  files: ['demo/coverage-babel/test/**/*.test.js'],
  coverage: true,
  coverageConfig: {
    nativeInstrumentation: false,
  },
  plugins: [
    babel({
      // avoid running babel on code that doesn't need it
      include: ['**/*/src/**/*.js'],
      babelHelpers: 'bundled',
      plugins: ['babel-plugin-istanbul'],
    }),
  ],
});
