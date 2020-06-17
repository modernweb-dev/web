import playwright, { Browser, Page } from 'playwright';
import { BrowserLauncher } from '@web/test-runner-core';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

const validBrowserTypes: BrowserType[] = ['chromium', 'firefox', 'webkit'];

export interface PlaywrightLauncherConfig {
  browserTypes: BrowserType[];
}

export function playwrightLauncher({
  browserTypes = ['chromium'],
}: Partial<PlaywrightLauncherConfig> = {}): BrowserLauncher {
  const browsers = new Map<string, Browser>();
  const debugBrowsers = new Map<string, Browser>();
  const activePages = new Map<string, Page>();
  const inactivePages: Page[] = [];

  if (browserTypes.some(t => !validBrowserTypes.includes(t))) {
    throw new Error(
      `Invalid browser types: ${browserTypes}. Valid browser types: ${validBrowserTypes.join(
        ', ',
      )}`,
    );
  }

  return {
    async start() {
      const browserNames: string[] = [];

      for (const type of browserTypes) {
        const name = `${type[0].toUpperCase()}${type.substring(1)}`;
        browserNames.push(name);
        const browser = await playwright[type].launch();
        browsers.set(name, browser);
      }

      return browserNames;
    },

    async stop() {
      for (const browser of browsers.values()) {
        if (browser.isConnected()) {
          await browser.close();
        }
      }

      for (const browser of debugBrowsers.values()) {
        if (browser.isConnected()) {
          await browser.close();
        }
      }
    },

    async startSession(session, url) {
      const browser = browsers.get(session.browserName);
      if (!browser) {
        throw new Error(`Unknown browser name: ${browser}`);
      }
      if (!browser.isConnected()) {
        throw new Error('Browser is closed');
      }

      let page: Page;
      if (inactivePages.length === 0) {
        page = await browser.newPage();
      } else {
        page = inactivePages.pop()!;
      }

      activePages.set(session.id, page);
      await page.goto(url);
    },

    stopSession(session) {
      const page = activePages.get(session.id);
      if (page) {
        activePages.delete(session.id);
        inactivePages.push(page);
      }
    },

    async startDebugSession(session, url) {
      const browserType = session.browserName.toLowerCase() as BrowserType;
      if (!validBrowserTypes.includes(browserType)) {
        throw new Error(`Invalid browser type: ${browserType}`);
      }

      let browser = debugBrowsers.get(browserType);
      if (browser && browser.isConnected()) {
        await browser.close();
      }
      browser = await playwright[browserType].launch({ headless: false });
      debugBrowsers.set(browserType, browser);

      const page = await browser.newPage();
      await page.goto(url);
    },
  };
}
