import * as puppeteerCore from 'puppeteer-core';
import { Page, Browser, LaunchOptions, launch as puppeteerCoreLaunch } from 'puppeteer-core';
import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { V8Coverage, v8ToIstanbul } from '@web/test-runner-coverage-v8';
import { findExecutablePath } from './findExecutablePath';

export interface ChromeLauncherConfig {
  executablePath?: string;
  puppeteer?: typeof puppeteerCore;
  args: string[];
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
  args,
}: Partial<ChromeLauncherConfig> = {}): BrowserLauncher & Record<string, unknown> {
  const executablePath = customExecutablePath ?? findExecutablePath();
  const activePages = new Map<string, Page>();
  const debugPages = new Map<string, Page>();
  const inactivePages: Page[] = [];
  let browser: Browser;
  let debugBrowser: undefined | Browser = undefined;
  let config: TestRunnerCoreConfig;
  let testFiles: string[];

  function launchBrowser(options: Partial<LaunchOptions> = {}) {
    if (puppeteer) {
      return puppeteer.launch({ ...options, args });
    } else {
      return puppeteerCoreLaunch({ ...options, executablePath, args });
    }
  }

  return {
    async start(_config, _testFiles) {
      config = _config;
      testFiles = _testFiles;
      browser = await launchBrowser();
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

    async startSession(session, url) {
      if (!browser.isConnected()) {
        throw new Error('Browser is closed');
      }

      let page: Page;
      if (inactivePages.length === 0) {
        page = await browser.newPage();
        if (config.coverage) {
          await page.coverage.startJSCoverage();
        }
      } else {
        page = inactivePages.pop()!;
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
      return Promise.all(inactivePages.map(page => getPageCoverage(config, testFiles, page)));
    },

    async startDebugSession(session, url) {
      if (debugBrowser?.isConnected()) {
        await debugBrowser.close();
      }
      debugBrowser = await launchBrowser({ devtools: true });
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
