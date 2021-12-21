import globby from 'globby';
import path from 'path';

export function collectTestFiles(patterns: string | string[], baseDir = process.cwd()) {
  // @ts-ignore
  const filePatterns = [].concat(patterns).map(pattern => pattern.split(path.sep).join('/'));

  return globby.sync(filePatterns, { cwd: baseDir, absolute: true });
}
