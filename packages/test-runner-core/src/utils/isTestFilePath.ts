import { PARAM_MANUAL_SESSION, PARAM_SESSION_ID } from './constants';

/**
 * Returns where a given path points to a test file. This should be
 * a browser path, such as an import path or network request.
 * @param path
 */
export function isTestFilePath(path: string) {
  // create a URL with a dummy domain
  const url = new URL(path, 'http://localhost:123');
  return url.searchParams.has(PARAM_SESSION_ID) || url.searchParams.has(PARAM_MANUAL_SESSION);
}
