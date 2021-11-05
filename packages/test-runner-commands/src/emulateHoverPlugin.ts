import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher } from '@web/test-runner-chrome';

export function emulateHoverPlugin(): TestRunnerPlugin {
  return {
    name: 'emulate-hover-command',

    async executeCommand({ command, payload, session }): Promise<any> {
      if (command === 'emulate-hover') {
        if (typeof payload !== 'string') {
          throw new Error('You must provide a selector as a string');
        }

        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);
          await page.hover(payload);
          return true;
        }

        throw new Error('emulating hover is only supported on puppeteer.');
      }
    },
  };
}

