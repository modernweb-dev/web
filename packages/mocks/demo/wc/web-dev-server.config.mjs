import { storybookPlugin } from '@web/dev-server-storybook';
import { mockPlugin } from '../../plugins.js';

export default {
  rootDir: '../..',
  open: true,
  nodeResolve: true,
  plugins: [
    mockPlugin(),
    storybookPlugin({
      type: 'web-components',
      configDir: 'demo/wc/.storybook',
    }),
  ],
};
