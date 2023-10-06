import { fileURLToPath } from 'url';
import { resolve } from 'path';

export default {
  rootDir: resolve(fileURLToPath(import.meta.url), '..', '..', '..'),
  appIndex: '/demo/export-conditions/index.html',
  nodeResolve: {
    exportConditions: ['default']
  },
};
