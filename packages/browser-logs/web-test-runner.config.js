/* eslint-disable */
const { esbuildPlugin } = require('@web/dev-server-esbuild');

module.exports = {
  rootDir: '../..',
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true })],
};
