import globby from 'globby';

const dedupeArray = (arr: string[]): string[] => [...new Set(arr)];

export async function collectTestFiles(patterns: string | string[]) {
  const testFiles: string[] = [];
  for (const pattern of Array.isArray(patterns) ? patterns : [patterns]) {
    testFiles.push(...(await globby(pattern)));
  }
  return dedupeArray(testFiles).map(f => f);
}
