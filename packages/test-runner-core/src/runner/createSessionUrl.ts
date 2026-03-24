import path from 'path';
import { type TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig.ts';
import { PARAM_SESSION_ID } from '../utils/constants.ts';
import { type BasicTestSession } from '../test-session/BasicTestSession.ts';

const toBrowserPathRegExp = new RegExp(path.sep === '\\' ? '\\\\' : path.sep, 'g');

export function toBrowserPath(filePath: string) {
  return filePath.replace(toBrowserPathRegExp, '/');
}

export function createSessionUrl(config: TestRunnerCoreConfig, session: BasicTestSession) {
  let browserPath: string;

  if (session.testFile.endsWith('.html')) {
    const resolvedPath = path.resolve(session.testFile);
    const relativePath = path.relative(config.rootDir, resolvedPath);
    browserPath = `/${toBrowserPath(relativePath)}`;
  } else {
    browserPath = '/';
  }
  const params = `?${PARAM_SESSION_ID}=${session.id}`;

  return `${config.protocol}//${config.hostname}:${config.port}${browserPath}${params}`;
}
