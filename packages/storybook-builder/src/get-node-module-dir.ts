import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getNodeModuleDir(moduleName: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${moduleName}/package.json`)));
}
