import path from 'path';
import { Context } from '@web/dev-server-core';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig.js';
import { PARAM_SESSION_ID, PARAM_MANUAL_SESSION } from '../utils/constants.js';

const toBrowserPathRegExp = new RegExp(path.sep === '\\' ? '\\\\' : path.sep, 'g');
const toFilePathRegeExp = new RegExp('/', 'g');

export function toBrowserPath(filePath: string) {
  return filePath.replace(toBrowserPathRegExp, '/');
}

export function toFilePath(browserPath: string) {
  return browserPath.replace(toFilePathRegeExp, path.sep);
}

export async function createTestFileImportPath(
  config: TestRunnerCoreConfig,
  context: Context,
  filePath: string,
  sessionId?: string,
) {
  const fullFilePath = path.resolve(filePath);
  const relativeToRootDir = path.relative(config.rootDir, fullFilePath);
  const browserPath = `/${toBrowserPath(relativeToRootDir)}`;
  const params = sessionId ? `?${PARAM_SESSION_ID}=${sessionId}` : `?${PARAM_MANUAL_SESSION}=true`;
  let importPath = encodeURI(`${browserPath}${params}`);

  // allow plugins to transform the import path
  for (const p of config.plugins ?? []) {
    if (p.transformImport) {
      const transformResult = await p.transformImport({ source: importPath, context });
      if (typeof transformResult === 'object' && typeof transformResult.id === 'string') {
        importPath = transformResult.id;
      } else if (typeof transformResult === 'string') {
        importPath = transformResult;
      }
    }
  }

  return importPath;
}
