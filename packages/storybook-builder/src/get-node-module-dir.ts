import { dirname } from 'node:path';


import { createRequire } from 'module';
const require = createRequire(import.meta.url);
export function getNodeModuleDir(moduleName: string): string {
  return dirname(require.resolve(`${moduleName}/package.json`));
}
