/* eslint-disable */
const rollupCommonjs = require('@rollup/plugin-commonjs');
const rollupPostcss = require('rollup-plugin-postcss');
const { fromRollup } = require('./dist/index');

const commonjs = fromRollup(rollupCommonjs);
const postcss = fromRollup(rollupPostcss);

module.exports = {
  rootDir: '../..',
  mimeTypes: {
    '**/*.css': 'js',
  },
  plugins: [commonjs(), postcss({ modules: true })],
};
