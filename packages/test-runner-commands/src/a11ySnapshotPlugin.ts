import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher, puppeteerCore } from '@web/test-runner-chrome';
import type { PlaywrightLauncher, playwright } from '@web/test-runner-playwright';

export type A11ySnapshotPayload = { selector?: string };

export function a11ySnapshotPlugin(): TestRunnerPlugin<A11ySnapshotPayload> {
  return {
    name: 'a11y-snapshot-command',
    async executeCommand({ command, payload, session }): Promise<any> {
      if (command === 'a11y-snapshot') {
        // handle specific behavior for playwright
        if (session.browser.type === 'playwright') {
          const page = (session.browser as PlaywrightLauncher).getPage(session.id);
          const options: {
            root?: playwright.ElementHandle;
          } = {};
          if (payload && payload.selector) {
            const root = await page.$(payload.selector);
            if (root) {
              options.root = root;
            }
          }
          const snapshot = await page.accessibility.snapshot(options);
          return snapshot;
        }

        // handle specific behavior for puppeteer
        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);
          const options: {
            root?: puppeteerCore.ElementHandle;
          } = {};
          if (payload && payload.selector) {
            // @ts-ignore
            const root = await page.$(payload.selector);
            if (root) {
              options.root = root;
            }
          }
          // @ts-ignore
          const snapshot = await page.accessibility.snapshot(options);
          return snapshot;
        }

        // you might not be able to support all browser launchers
        throw new Error(
          `Acessibility snapshot is not supported for browser type ${session.browser.type}.`,
        );
      }
    },
  };
}
