import chalk from 'chalk';

export function getWatchCommands(
  coverage: boolean,
  testFiles: string[],
  focusedTest?: boolean,
): string[] {
  if (focusedTest) {
    return [
      `${chalk.gray('Press')} F ${chalk.gray('to focus another test file.')}`,
      `${chalk.gray('Press')} D ${chalk.gray('to debug in the browser.')}`,
      coverage ? `${chalk.gray('Press')} C ${chalk.gray('to view coverage details.')}` : '',
      `${chalk.gray('Press')} Q ${chalk.gray('to exit watch mode.')}`,
      `${chalk.gray('Press')} Enter ${chalk.gray('to re-run this test file.')}`,
      `${chalk.gray('Press')} ESC ${chalk.gray('to exit focus mode')}`,
    ].filter(_ => !!_);
  }

  return [
    testFiles.length > 1
      ? `${chalk.gray('Press')} F ${chalk.gray('to focus on a test file.')}`
      : '',
    `${chalk.gray('Press')} D ${chalk.gray('to debug in the browser.')}`,
    `${chalk.gray('Press')} M ${chalk.gray('to debug manually in a custom browser.')}`,
    coverage ? `${chalk.gray('Press')} C ${chalk.gray('to view coverage details.')}` : '',
    `${chalk.gray('Press')} Q ${chalk.gray('to quit watch mode.')}`,
    `${chalk.gray('Press')} Enter ${chalk.gray('to re-run all tests.')}`,
  ].filter(_ => !!_);
}
