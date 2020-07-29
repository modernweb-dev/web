/* eslint-disable */
const rollupCommonjs = require('@rollup/plugin-commonjs');
const rollupPostcss = require('rollup-plugin-postcss');
const { fromRollup } = require('./dist/index');

const commonjs = fromRollup(rollupCommonjs);
const postcss = fromRollup(rollupPostcss);

module.exports = {
  rootDir: '../..',
  plugins: [
    commonjs(),
    {
      name: 'serve-css',
      resolveMimeType(context) {
        if (context.path.endsWith('.css')) {
          return 'js';
        }
      },
    },
    postcss({ modules: true }),
  ],
};
