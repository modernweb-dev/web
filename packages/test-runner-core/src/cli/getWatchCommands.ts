import { gray } from 'nanocolors';

export function getWatchCommands(
  coverage: boolean,
  testFiles: string[],
  focusedTest?: boolean,
): string[] {
  if (focusedTest) {
    return [
      `${gray('Press')} F ${gray('to focus another test file.')}`,
      `${gray('Press')} D ${gray('to debug in the browser.')}`,
      coverage ? `${gray('Press')} C ${gray('to view coverage details.')}` : '',
      `${gray('Press')} Q ${gray('to exit watch mode.')}`,
      `${gray('Press')} Enter ${gray('to re-run this test file.')}`,
      `${gray('Press')} ESC ${gray('to exit focus mode')}`,
    ].filter(_ => !!_);
  }

  return [
    testFiles.length > 1 ? `${gray('Press')} F ${gray('to focus on a test file.')}` : '',
    `${gray('Press')} D ${gray('to debug in the browser.')}`,
    `${gray('Press')} M ${gray('to debug manually in a custom browser.')}`,
    coverage ? `${gray('Press')} C ${gray('to view coverage details.')}` : '',
    `${gray('Press')} Q ${gray('to quit watch mode.')}`,
    `${gray('Press')} Enter ${gray('to re-run all tests.')}`,
  ].filter(_ => !!_);
}
