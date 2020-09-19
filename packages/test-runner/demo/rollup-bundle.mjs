import { rollupBundlePlugin } from '@web/dev-server-rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import globby from 'globby';

const testFiles = globby.sync('demo/test/pass-*.test.js');

export default {
  rootDir: '../..',
  nodeResolve: true,
  files: testFiles,
  plugins: [
    rollupBundlePlugin({
      rollupConfig: {
        input: testFiles,
        plugins: [nodeResolve()],
      },
    }),
  ],
};
