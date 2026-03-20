import getPackageType from './getPackageType.ts';
import path from 'path';
import requireConfig from './requireConfig.ts';
import importConfigFunction from './importConfig.ts';

async function importOrRequireConfig(configPath: string, basedir: string): Promise<object> {
  const ext = path.extname(configPath);

  switch (ext) {
    case '.mjs':
      return importConfigFunction(configPath);
    case '.cjs':
      return requireConfig(configPath);
    default:
      const packageType = await getPackageType(basedir);
      return packageType === 'module' ? importConfigFunction(configPath) : requireConfig(configPath);
  }
}

export default importOrRequireConfig;
