import { TerminalEntry } from '../Terminal';
import chalk from 'chalk';

export function getSelectFilesMenu(succeededFiles: string[], failedFiles: string[]) {
  const maxI = succeededFiles.length + failedFiles.length;
  const minWidth = maxI.toString().length + 1;

  function formatTestFile(f: string, i: number, offset: number, failed: boolean) {
    return `[${i + offset}]${' '.repeat(
      Math.max(0, minWidth - (i + offset).toString().length),
    )}${chalk[failed ? 'red' : 'cyan'](f)}`;
  }

  const entries: TerminalEntry[] = [
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
