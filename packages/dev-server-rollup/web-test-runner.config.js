/* eslint-disable */
const commonjs = require('@rollup/plugin-commonjs');
const postcss = require('rollup-plugin-postcss');
const { rollupAdapter } = require('./dist/index');

module.exports = {
  rootDir: '../..',
  plugins: [
    rollupAdapter(commonjs()),
    {
      name: 'serve-css',
      resolveMimeType(context) {
        if (context.path.endsWith('.css')) {
          return 'js';
        }
      },
    },
    rollupAdapter(postcss({ modules: true })),
  ],
};
