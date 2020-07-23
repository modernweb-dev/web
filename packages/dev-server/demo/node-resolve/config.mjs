import path from 'path';
import { fileURLToPath } from 'url';

export default {
  rootDir: fileURLToPath(path.join(import.meta.url, '../../../../..')),
  appIndex: 'packages/dev-server/demo/node-resolve/index.html',
  nodeResolve: true,
};
