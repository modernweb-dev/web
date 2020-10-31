import { storybookPlugin } from '../../index.mjs';

export default {
  rootDir: '../..',
  open: true,
  nodeResolve: true,
  plugins: [
    storybookPlugin({
      type: 'web-components',
      configDir: 'demo/wc/.storybook',
    }),
  ],
};
