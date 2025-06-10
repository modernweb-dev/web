import { dirname } from 'node:path';

export function getNodeModuleDir(moduleName: string): string {
  return dirname(require.resolve(`${moduleName}/package.json`));
}
