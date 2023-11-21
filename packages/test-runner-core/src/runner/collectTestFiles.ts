import globby from 'globby';
import { sep } from 'node:path';

export function collectTestFiles(patterns: string | string[], baseDir = process.cwd()) {
  const normalizedPatterns = [patterns].flat().map(p => p.split(sep).join('/'));
  return globby.sync(normalizedPatterns, { cwd: baseDir, absolute: true });
}
