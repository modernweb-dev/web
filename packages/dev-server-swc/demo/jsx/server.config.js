const { esbuildPlugin } = require('../../dist/esbuildPlugin');

module.exports = {
  open: true,
  rootDir: '../..',
  nodeResolve: true,
  appIndex: 'packages/dev-server-esbuild/demo/jsx/index.html',
  plugins: [esbuildPlugin({ jsx: true, jsxFactory: 'h', jsxFragment: 'Fragment' })],
};
