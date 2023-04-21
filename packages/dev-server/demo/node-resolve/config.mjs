import { fileURLToPath } from 'url';
import { resolve } from 'path';

export default {
  rootDir: resolve(fileURLToPath(import.meta.url), '..', '..', '..'),
  appIndex: '/demo/node-resolve/index.html',
  nodeResolve: true,
};
