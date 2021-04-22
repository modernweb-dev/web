import { fileURLToPath } from 'url';
import { resolve } from 'path';

export default {
  rootDir: resolve(fileURLToPath(import.meta.url), '..', '..', '..'),
  appIndex: 'demo/base-path/index.html',
  basePath: '/my-base-path',
};
