const { hmrPlugin } = require('../dist/index');

module.exports = {
  rootDir: '.',
  watch: true,
  plugins: [hmrPlugin()],
};
