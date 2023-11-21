import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  rootDir: '../..',
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true })],
};
