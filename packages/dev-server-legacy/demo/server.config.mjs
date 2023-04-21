import { legacyPlugin } from '../dist/index.js';

export default {
  open: true,
  nodeResolve: true,
  appIndex: 'demo/index.html',
  plugins: [
    legacyPlugin({
      coreJs: true,
      fetch: true,
      webcomponents: true,
      regeneratorRuntime: 'always',
      systemjs: true,
    }),
  ],
};
