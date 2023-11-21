import { dirname } from 'node:path';

export async function getNodeModuleDir(moduleName: string): Promise<string> {
  if (!import.meta.resolve) {
    throw new Error('import.meta.resolve was not set');
  }
  return dirname(await import.meta.resolve(`${moduleName}/package.json`));
}
