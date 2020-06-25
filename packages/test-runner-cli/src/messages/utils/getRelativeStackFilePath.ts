import path from 'path';
import { toFilePath } from './toFilePath';

const REGEXP_FILE_URL = /(\(|@)(?<url>.*\.\w{2,3}.*?)(:\d+:\d+)(\)|$)/;

export function getRelativeStackFilePath(string: string, rootDir: string, serverAddress: string) {
  const matchedPath = string.match(REGEXP_FILE_URL)?.groups?.url;

  if (matchedPath) {
    const urlPath = matchedPath.replace(serverAddress, '');
    const fullFilePath = path.join(rootDir, toFilePath(urlPath));
    const relativeFilePath = path.relative(process.cwd(), fullFilePath);
    return { url: path.posix.join(serverAddress, urlPath), urlPath, matchedPath, relativeFilePath };
  }

  return null;
}
