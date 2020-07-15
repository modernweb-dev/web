const { esbuildPlugin } = require('../../dist/esbuildPlugin');

module.exports = {
  open: true,
  rootDir: '../..',
  nodeResolve: true,
  appIndex: 'packages/dev-server-esbuild/demo/ts/index.html',
  plugins: [esbuildPlugin({ ts: true })],
};
