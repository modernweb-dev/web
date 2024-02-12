import { createRequire } from 'node:module';
import { dirname } from 'node:path';

const require = createRequire(import.meta.url);

export function getNodeModuleDir(moduleName: string): string {
  return dirname(require.resolve(`${moduleName}/package.json`));
}
