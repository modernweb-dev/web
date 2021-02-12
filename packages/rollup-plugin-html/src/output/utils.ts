import path from 'path';

export function toBrowserPath(filePath: string) {
  return filePath.split(path.sep).join('/');
}
