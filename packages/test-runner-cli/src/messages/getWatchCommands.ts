import { TerminalEntry } from '../Terminal';
import chalk from 'chalk';
import { MenuType, MENUS } from '../TestRunnerCli';

export function getWatchCommands(activeMenu: MenuType, focusedTest?: string): TerminalEntry[] {
  switch (activeMenu) {
    case MENUS.OVERVIEW:
      if (focusedTest) {
        return [
          `${chalk.gray('Press')} F ${chalk.gray('to focus another test file.')}`,
          `${chalk.gray('Press')} D ${chalk.gray('to debug in the browser.')}`,
          `${chalk.gray('Press')} Q ${chalk.gray('to exit watch mode.')}`,
          `${chalk.gray('Press')} Enter ${chalk.gray('to re-run this test file.')}`,
          `${chalk.gray('Press')} ESC ${chalk.gray('to exit focus mode')}`,
        ];
      }

      return [
        `${chalk.gray('Press')} F ${chalk.gray('to focus on a test file.')}`,
        `${chalk.gray('Press')} D ${chalk.gray('to debug in the browser.')}`,
        `${chalk.gray('Press')} Q ${chalk.gray('to quit watch mode.')}`,
        `${chalk.gray('Press')} Enter ${chalk.gray('to re-run all tests.')}`,
      ];
    case MENUS.FOCUS_SELECT_FILE:
    case MENUS.DEBUG_SELECT_FILE:
      return [
        `${chalk.gray('Press')} Q ${chalk.gray('to exit watch mode.')}`,
        `${chalk.gray('Press')} ESC ${chalk.gray('to exit focus mode')}`,
      ];
    default:
      return [];
  }
}
