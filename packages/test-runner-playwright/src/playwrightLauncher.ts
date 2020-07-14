import playwright, { Browser, Page } from 'playwright';
import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { v8ToIstanbul, V8Coverage } from '@web/test-runner-coverage-v8';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

const validBrowserTypes: BrowserType[] = ['chromium', 'firefox', 'webkit'];

export interface PlaywrightLauncherConfig {
  browserTypes: BrowserType[];
}

async function getPageCoverage(config: TestRunnerCoreConfig, testFiles: string[], page: Page) {
  const coverage = ((await page.coverage?.stopJSCoverage()) ?? []) as V8Coverage[];
  return v8ToIstanbul(config, testFiles, coverage);
}

export function playwrightLauncher({
  browserTypes = ['chromium'],
}: Partial<PlaywrightLauncherConfig> = {}): BrowserLauncher {
  const browsers = new Map<string, Browser>();
  const debugBrowsers = new Map<string, Browser>();
  const activePages = new Map<string, Page>();
  const debugPages = new Map<string, Page>();
  const inactivePages: Page[] = [];
  let config: TestRunnerCoreConfig;
  let testFiles: string[];

  if (browserTypes.some(t => !validBrowserTypes.includes(t))) {
    throw new Error(
      `Invalid browser types: ${browserTypes}. Valid browser types: ${validBrowserTypes.join(
        ', ',
      )}`,
    );
  }

  return {
    async start(_config, _testFiles) {
      config = _config;
      testFiles = _testFiles;
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
        if (config.coverage) {
          await page.coverage?.startJSCoverage();
        }
      } else {
        page = inactivePages.pop()!;
      }

      activePages.set(session.id, page);
      await page.setViewportSize({ height: 600, width: 800 });
      await page.goto(url);
    },

    stopSession(session) {
      const page = activePages.get(session.id);
      if (page) {
        activePages.delete(session.id);
        inactivePages.push(page);
      }
    },

    getTestCoverage() {
      return Promise.all(inactivePages.map(page => getPageCoverage(config, testFiles, page)));
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
      debugPages.set(session.id, page);
      page.on('close', () => {
        debugPages.delete(session.id);
      });
      await page.goto(url);
    },

    setViewport(session, viewport) {
      const page = activePages.get(session.id);
      const debugPage = debugPages.get(session.id);
      if (!page && !debugPage) {
        throw new Error(`Cannot set viewport for inactive session: ${session.id}`);
      }
      return (page! || debugPage!).setViewportSize(viewport);
    },
  };
}
