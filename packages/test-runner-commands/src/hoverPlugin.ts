import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher } from '@web/test-runner-chrome';
import type { WebdriverLauncher } from '@web/test-runner-webdriver';
import type { PlaywrightLauncher } from '@web/test-runner-playwright';

export function hoverPlugin(): TestRunnerPlugin {
  return {
    name: 'hover-command',

    async executeCommand({ command, payload, session }): Promise<any> {
      if (command === 'hover') {
        if (typeof payload !== 'string') {
          throw new Error('You must provide a selector as a string');
        }

        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);
          await page.hover(payload);
          return true;
        }

        if (session.browser.type === 'playwright') {
          const page = (session.browser as PlaywrightLauncher).getPage(session.id);
          await page.hover(payload);
          return true;
        }

        if (session.browser.type === 'webdriver') {
          const browser = session.browser as WebdriverLauncher;
          await browser.hover(session.id, payload);
          return true;
        }

        throw new Error(`Browser launcher ${session.browser.type} does not support hover command at the moment.`);
      }
    },
  };
}

