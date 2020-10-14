import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  rootDir: '../../',
  preserveSymlinks: true,
  nodeResolve: true,
  plugins: [legacyPlugin()],
};
