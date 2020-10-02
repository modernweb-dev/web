import { TestRunnerCoreConfig } from '@web/test-runner-core';
import chalk from 'chalk';
import ip from 'ip';

export function getManualDebugMenu(config: TestRunnerCoreConfig): string[] {
  const localAddress = `${config.protocol}//${config.hostname}:${config.port}/`;
  const networkAddress = `${config.protocol}//${ip.address()}:${config.port}/`;

  return [
    'Debug manually in a browser not controlled by the test runner.',
    ' ',
    "Advanced functionalities such commands for changing viewport and screenshots don't work there.",
    'Use the regular debug option to debug in a controlled browser.',
    ' ',
    `Local address:   ${chalk.cyanBright(localAddress)}`,
    `Network address: ${chalk.cyanBright(networkAddress)}`,
    ' ',
    `${chalk.gray('Press')} D ${chalk.gray('to open the browser.')}`,
    `${chalk.gray('Press')} ${config.manual ? 'Q' : 'ESC'} ${chalk.gray('to exit manual debug.')}`,
  ].filter(_ => !!_);
}
