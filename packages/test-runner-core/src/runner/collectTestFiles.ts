import globby from 'globby';
import path from 'path';

export function collectTestFiles(patterns: string | string[], baseDir = process.cwd()) {
  const testFiles = new Set<string>();

  for (const pattern of Array.isArray(patterns) ? patterns : [patterns]) {
    const normalizedPattern = pattern.split(path.sep).join('/');
    const foundFiles = globby.sync(normalizedPattern, { cwd: baseDir, absolute: true });
    for (const file of foundFiles) {
      testFiles.add(file);
    }
  }

  return Array.from(testFiles);
}
