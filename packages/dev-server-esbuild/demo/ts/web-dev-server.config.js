const { esbuildPlugin } = require('@web/dev-server-esbuild');

module.exports = {
  open: true,
  // rootDir: '../..',
  nodeResolve: true,
  appIndex: 'index.html',
  plugins: [esbuildPlugin({ ts: true })],
};
