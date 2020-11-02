import { hmrPlugin } from '../../index.mjs';

export default {
  rootDir: '.',
  open: 'demo/vanilla/',
  plugins: [hmrPlugin()],
};
