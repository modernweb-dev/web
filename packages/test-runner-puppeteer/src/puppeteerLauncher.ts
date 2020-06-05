import { Browser, launch, Page } from 'puppeteer';
import { BrowserLauncher, constants, TestRunnerConfig, TestSession } from '@web/test-runner-core';

const { PARAM_SESSION_ID, PARAM_DEBUG } = constants;

export interface PuppeteerLauncherConfig {
  args: string[];
}

export function puppeteerLauncher({
  args,
}: Partial<PuppeteerLauncherConfig> = {}): BrowserLauncher {
  const activePages = new Map<string, Page>();
  const inactivePages: Page[] = [];
  let config: TestRunnerConfig;
  let serverAddress: string;
  let browser: Browser;
  let debugBrowser: undefined | Browser = undefined;

  const createUrl = (session: TestSession) => `${serverAddress}?${PARAM_SESSION_ID}=${session.id}`;

  return {
    async start(_config) {
      config = _config;
      browser = await launch({ args });
      serverAddress = `${config.address}:${config.port}/`;
      return ['Chrome'];
    },

    async stop() {
      if (browser.isConnected()) {
        await browser.close();
      }

      if (debugBrowser?.isConnected()) {
        await debugBrowser.close();
      }
    },

    async startDebugSession(session) {
      if (debugBrowser?.isConnected()) {
        await debugBrowser.close();
      }
      debugBrowser = await launch({ args, devtools: true });
      const page = await debugBrowser.newPage();
      await page.goto(`${createUrl(session)}&${PARAM_DEBUG}=true`);
    },

    async startSession(session) {
      if (!browser.isConnected()) {
        throw new Error('Browser is closed');
      }

      let page: Page;
      if (true && inactivePages.length === 0) {
        page = await browser.newPage();
      } else {
        page = inactivePages.pop()!;
      }

      activePages.set(session.id, page);
      await page.goto(createUrl(session));
    },

    stopSession(session) {
      const page = activePages.get(session.id);
      if (page) {
        activePages.delete(session.id);
        inactivePages.push(page);
      }
    },
  };
}
