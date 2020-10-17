const html = require('../../dist/index').default;

module.exports = {
  output: {
    dir: './demo/dist',
  },
  plugins: [
    html({
      input: '**/*.html',
      flattenOutput: false,
      rootDir: __dirname,
    }),
  ],
};
