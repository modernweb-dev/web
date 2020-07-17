import * as puppeteerCore from 'puppeteer-core';
import { Page, Browser, LaunchOptions, launch as puppeteerCoreLaunch } from 'puppeteer-core';
import { BrowserLauncher, TestRunnerCoreConfig, CoverageMapData } from '@web/test-runner-core';
import { V8Coverage, v8ToIstanbul } from '@web/test-runner-coverage-v8';
import { findExecutablePath } from './findExecutablePath';

export interface ChromeLauncherConfig {
  executablePath?: string;
  puppeteer?: typeof puppeteerCore;
  launchOptions?: LaunchOptions;
}

async function getPageCoverage(config: TestRunnerCoreConfig, testFiles: string[], page: Page) {
  // TODO: this is using a private puppeteer API to grab v8 test coverage, this can be removed
  // when https://github.com/puppeteer/puppeteer/issues/2136 is resolved
  const response = (await (page as any)._client.send('Profiler.takePreciseCoverage')) as {
    result: V8Coverage[];
  };
  // puppeteer already has the script sources available, remove this when above issue is resolved
  const scriptSources = (page as any)?.coverage?._jsCoverage?._scriptSources;

  const v8Coverage = response.result
    // remove puppeteer specific scripts
    .filter(r => r.url && r.url !== '__puppeteer_evaluation_script__')
    // attach source code
    .map(r => ({
      ...r,
      source: scriptSources.get(r.scriptId),
    }));

  await page.coverage?.stopJSCoverage();
  return await v8ToIstanbul(config, testFiles, v8Coverage);
}

export function chromeLauncher({
  executablePath: customExecutablePath,
  puppeteer,
  launchOptions = {},
}: Partial<ChromeLauncherConfig> = {}): BrowserLauncher & Record<string, unknown> {
  const executablePath = customExecutablePath ?? findExecutablePath();
  const activePages = new Map<string, Page>();
  const debugPages = new Map<string, Page>();
  const inactivePages: Page[] = [];
  // puppeteer does not indicate whether coverage is enabled, so we track it here
  const pagesWithCoverageEnabled = new WeakSet();
  const cachedCoverage = new WeakMap<Page, CoverageMapData>();
  let browser: Browser;
  let debugBrowser: undefined | Browser = undefined;
  let config: TestRunnerCoreConfig;
  let testFiles: string[];

  function launchBrowser(launchOptions: LaunchOptions) {
    if (puppeteer) {
      return puppeteer.launch(launchOptions);
    } else {
      return puppeteerCoreLaunch({ ...launchOptions, executablePath });
    }
  }

  return {
    async start(_config, _testFiles) {
      config = _config;
      testFiles = _testFiles;
      browser = await launchBrowser(launchOptions);

      return launchOptions.product
        ? `${launchOptions.product[0].toUpperCase()}${launchOptions.product.substring(1)}`
        : 'Chrome';
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

      if (config.coverage && !pagesWithCoverageEnabled.has(page)) {
        pagesWithCoverageEnabled.add(page);
        cachedCoverage.delete(page);
        await page.coverage.startJSCoverage();
      }
      activePages.set(session.id, page);
      await page.setViewport({ height: 600, width: 800 });
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
      return Promise.all(
        inactivePages.map(page => {
          if (pagesWithCoverageEnabled.has(page)) {
            pagesWithCoverageEnabled.delete(page);
            return getPageCoverage(config, testFiles, page).then(coverage => {
              cachedCoverage.set(page, coverage);
              return coverage;
            });
          }
          return cachedCoverage.get(page)!;
        }),
      );
    },

    async startDebugSession(session, url) {
      if (debugBrowser?.isConnected()) {
        await debugBrowser.close();
      }
      debugBrowser = await launchBrowser({ ...launchOptions, devtools: true });
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
      return (page! || debugPage!).setViewport(viewport);
    },
  };
}
