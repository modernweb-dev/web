const { swcPlugin } = require('../../dist/swcPlugin');

module.exports = {
  open: true,
  rootDir: '../..',
  nodeResolve: true,
  appIndex: 'packages/dev-server-swc/demo/jsx/index.html',
  plugins: [swcPlugin({ jsx: true, jsxFactory: 'h', jsxFragment: 'Fragment' })],
};
