import { getRelativeStackFilePath } from './getRelativeStackFilePath';

export function replaceRelativeStackFilePath(
  string: string,
  rootDir: string,
  serverAddress: string,
) {
  const result = getRelativeStackFilePath(string, rootDir, serverAddress);
  if (!result) {
    return string.replace(serverAddress, '');
  }

  // replace url with relative file path
  return string.replace(result.matchedPath, result.relativeFilePath);
}
