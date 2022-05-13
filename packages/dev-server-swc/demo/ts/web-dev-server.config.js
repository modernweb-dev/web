const { swcPlugin } = require('@web/dev-server-swc');

module.exports = {
  open: true,
  // rootDir: '../..',
  nodeResolve: true,
  appIndex: 'index.html',
  plugins: [swcPlugin({ ts: true })],
};
