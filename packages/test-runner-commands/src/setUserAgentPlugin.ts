import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher } from '@web/test-runner-chrome';

export function setUserAgentPlugin(): TestRunnerPlugin {
  return {
    name: 'set-user-agent-command',

    async executeCommand({ command, payload, session }) {
      if (command === 'set-user-agent') {
        if (typeof payload !== 'string') {
          throw new Error('You must provide a user agent as a string');
        }

        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);

          await page.setUserAgent(payload);
          return true;
        }

        throw new Error('set user agent is only supported on puppeteer.');
      }
    },
  };
}
