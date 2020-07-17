import playwright, { Browser, Page, LaunchOptions } from 'playwright';
import { BrowserLauncher, TestRunnerCoreConfig, CoverageMapData } from '@web/test-runner-core';
import { v8ToIstanbul, V8Coverage } from '@web/test-runner-coverage-v8';

export type ProductType = 'chromium' | 'firefox' | 'webkit';

const validProductTypes: ProductType[] = ['chromium', 'firefox', 'webkit'];

export interface PlaywrightLauncherConfig {
  product?: ProductType;
  launchOptions?: LaunchOptions;
}

async function getPageCoverage(config: TestRunnerCoreConfig, testFiles: string[], page: Page) {
  const coverage = ((await page.coverage?.stopJSCoverage()) ?? []) as V8Coverage[];
  return v8ToIstanbul(config, testFiles, coverage);
}

export function playwrightLauncher({
  product = 'chromium',
  launchOptions = {},
}: PlaywrightLauncherConfig = {}): BrowserLauncher {
  const activePages = new Map<string, Page>();
  const debugPages = new Map<string, Page>();
  const inactivePages: Page[] = [];
  // playwright does not indicate whether coverage is enabled, so we track it here
  const pagesWithCoverageEnabled = new WeakSet();
  const cachedCoverages = new WeakMap<Page, CoverageMapData>();
  let browser: Browser;
  let debugBrowser: undefined | Browser = undefined;
  let config: TestRunnerCoreConfig;
  let testFiles: string[];

  if (!validProductTypes.includes(product)) {
    throw new Error(
      `Invalid product: ${product}. Valid product types: ${validProductTypes.join(', ')}`,
    );
  }

  return {
    async start(_config, _testFiles) {
      config = _config;
      testFiles = _testFiles;
      browser = await playwright[product].launch(launchOptions);

      return `${product[0].toUpperCase()}${product.substring(1)}`;
    },

    async stop() {
      if (browser.isConnected()) {
        await browser.close();
      }

      if (debugBrowser?.isConnected()) {
        await debugBrowser.close();
      }
    },

    async startSession(session, url) {
      if (!browser.isConnected()) {
        throw new Error('Browser is closed');
      }

      let page: Page;
      if (inactivePages.length === 0) {
        page = await browser.newPage();
      } else {
        page = inactivePages.pop()!;
      }

      if (config.coverage && page.coverage && !pagesWithCoverageEnabled.has(page)) {
        pagesWithCoverageEnabled.add(page);
        cachedCoverages.delete(page);
        await page.coverage?.startJSCoverage();
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

    async getTestCoverage() {
      const coverages: (CoverageMapData | Promise<CoverageMapData>)[] = [];

      for (const page of inactivePages) {
        if (pagesWithCoverageEnabled.has(page)) {
          pagesWithCoverageEnabled.delete(page);

          const coverage = await getPageCoverage(config, testFiles, page);
          cachedCoverages.set(page, coverage);
          coverages.push(coverage);
        }

        const cachedCoverage = cachedCoverages.get(page)!;
        if (cachedCoverage) {
          coverages.push(cachedCoverage);
        }
      }

      return Promise.all(coverages);
    },

    async startDebugSession(session, url) {
      if (debugBrowser?.isConnected()) {
        await debugBrowser.close();
      }
      debugBrowser = await playwright[product].launch({ ...launchOptions, headless: false });
      const page = await debugBrowser.newPage();
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
