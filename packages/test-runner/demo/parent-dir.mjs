import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(path.dirname(import.meta.url));
process.chdir(path.join(__dirname, 'test', 'parent-dir'));

export default {
  rootDir: path.join(__dirname, '..', '..', '..'),
  files: ['../pass-1.test.js'],
  preserveSymlinks: true,
  nodeResolve: true,
};
