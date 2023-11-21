import * as path from 'node:path';

export function toBrowserPath(filePath: string) {
  return filePath.split(path.sep).join('/');
}
