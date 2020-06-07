import playwright, { Browser, Page } from 'playwright';
import { BrowserLauncher, constants, TestRunnerConfig, TestSession } from '@web/test-runner-core';

const { PARAM_SESSION_ID, PARAM_DEBUG } = constants;

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
  const createUrl = (session: TestSession) => `${serverAddress}?${PARAM_SESSION_ID}=${session.id}`;
  const inactivePages: Page[] = [];

  if (browserTypes.some(t => !validBrowserTypes.includes(t))) {
    throw new Error(
      `Invalid browser types: ${browserTypes}. Valid browser types: ${validBrowserTypes.join(
        ', ',
      )}`,
    );
  }

  let config: TestRunnerConfig;
  let serverAddress: string;

  return {
    async start(_config) {
      config = _config;
      serverAddress = `${config.address}:${config.port}/`;
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
        await browser.close();
      }
      for (const browser of debugBrowsers.values()) {
        await browser.close();
      }
    },

    async startDebugSession(session) {
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
      await page.goto(`${createUrl(session)}&${PARAM_DEBUG}=true`);
    },

    async startSession(session) {
      const browser = browsers.get(session.browserName);
      if (!browser) {
        throw new Error(`Unknown browser name: ${browser}`);
      }
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
