import { fromRollup } from '@web/dev-server-rollup';
import { babel as rollupBabel } from '@rollup/plugin-babel';

const babel = fromRollup(rollupBabel);

export default /** @type {import('@web/test-runner').TestRunnerConfig} */ ({
  rootDir: '../..',
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    nativeInstrumentation: false,
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      plugins: ['babel-plugin-istanbul'],
    }),
  ],
});
