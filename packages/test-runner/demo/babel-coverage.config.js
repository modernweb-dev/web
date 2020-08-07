const { fromRollup } = require('@web/dev-server-rollup');
const { babel: rollupBabel } = require('@rollup/plugin-babel');

const babel = fromRollup(rollupBabel);

module.exports = /** @type {import('@web/test-runner').TestRunnerConfig} */ ({
  rootDir: '../..',
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    nativeInstrumentation: false,
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      plugins: [require.resolve('babel-plugin-istanbul')],
    }),
  ],
});
