import { cyan, gray } from 'nanocolors';
import ip from 'ip';

import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';

export function getManualDebugMenu(config: TestRunnerCoreConfig): string[] {
  const localAddress = `${config.protocol}//${config.hostname}:${config.port}/`;
  const networkAddress = `${config.protocol}//${ip.address()}:${config.port}/`;

  return [
    'Debug manually in a browser not controlled by the test runner.',
    ' ',
    "Advanced functionalities such commands for changing viewport and screenshots don't work there.",
    'Use the regular debug option to debug in a controlled browser.',
    ' ',
    `Local address:   ${cyan(localAddress)}`,
    `Network address: ${cyan(networkAddress)}`,
    ' ',
    `${gray('Press')} D ${gray('to open the browser.')}`,
    `${gray('Press')} ${config.manual ? 'Q' : 'ESC'} ${gray('to exit manual debug.')}`,
  ].filter(_ => !!_);
}
