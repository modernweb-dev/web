/* eslint-disable */
const commonjs = require('@rollup/plugin-commonjs');
const { rollupAdapter } = require('./dist/index');

module.exports = {
  rootDir: '../../..',
  plugins: [rollupAdapter(commonjs())],
};
