const { hmrPlugin } = require('../dist/index');

module.exports = {
  rootDir: '.',
  plugins: [hmrPlugin()],
};
