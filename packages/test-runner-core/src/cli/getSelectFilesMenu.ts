import { cyan, red } from 'nanocolors';
import { relative } from 'path';

export function getSelectFilesMenu(succeededFiles: string[], failedFiles: string[]) {
  const maxI = succeededFiles.length + failedFiles.length;
  const minWidth = maxI.toString().length + 1;

  function formatTestFile(file: string, i: number, offset: number, failed: boolean) {
    const relativePath = relative(process.cwd(), file);
    return `[${i + offset}]${' '.repeat(Math.max(0, minWidth - (i + offset).toString().length))}${
      failed ? red(relativePath) : cyan(relativePath)
    }`;
  }

  const entries: string[] = [
    'Test files:\n',
    ...succeededFiles.map((f, i) => formatTestFile(f, i, failedFiles.length + 1, false)),
    '',
  ];

  if (failedFiles.length > 0) {
    entries.push(
      'Failed test files:\n',
      ...failedFiles.map((f, i) => formatTestFile(f, i, 1, true)),
    );
  }

  return entries;
}
