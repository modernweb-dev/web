const { esbuildPlugin } = require('@web/dev-server-esbuild');

module.exports = {
  // this points to the root dir of your repository
  // in your project this is probably not needed
  rootDir: '../../..',

  devServer: {
    plugins: [esbuildPlugin({ tsx: true, jsxFactory: 'h', jsxFragment: 'Fragment' })],
  },
};
