const html = require('../../dist/index').default;

module.exports = {
  input: 'demo/spa/index.html',
  output: {
    dir: './demo/dist',
  },
  plugins: [html({
    absoluteBaseUrl: 'http://localhost:8000',
    extractAssets: [
      {tagName: 'my-first-el', attribute: 'my-src'},
      {tagName: 'my-second-el', attribute: 'my-src'},
    ]
  })],
};
