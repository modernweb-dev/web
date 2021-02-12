import { storybookPlugin } from '../../index.mjs';

export default {
  rootDir: '../..',
  open: true,
  nodeResolve: true,
  plugins: [
    storybookPlugin({
      type: 'preact',
      configDir: 'demo/preact/.storybook',
    }),
  ],
};
