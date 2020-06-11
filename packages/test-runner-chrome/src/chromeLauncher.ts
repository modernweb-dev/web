import * as puppeteerCore from 'puppeteer-core';
import { Page, Browser, LaunchOptions, launch as puppeteerCoreLaunch } from 'puppeteer-core';
import { BrowserLauncher, constants, TestRunnerConfig, TestSession } from '@web/test-runner-core';
import { findExecutablePath } from './findExecutablePath';

const { PARAM_SESSION_ID, PARAM_DEBUG } = constants;

export interface ChromeLauncherConfig {
  executablePath?: string;
  puppeteer?: typeof puppeteerCore;
  args: string[];
}

export function chromeLauncher({
  executablePath: customExecutablePath,
  puppeteer,
  args,
}: Partial<ChromeLauncherConfig> = {}): BrowserLauncher {
  const executablePath = customExecutablePath ?? findExecutablePath();
  const activePages = new Map<string, Page>();
  const inactivePages: Page[] = [];
  let config: TestRunnerConfig;
  let serverAddress: string;
  let browser: Browser;
  let debugBrowser: undefined | Browser = undefined;

  const createUrl = (session: TestSession) => `${serverAddress}?${PARAM_SESSION_ID}=${session.id}`;
  function launchBrowser(options: Partial<LaunchOptions> = {}) {
    if (puppeteer) {
      return puppeteer.launch({ ...options, args });
    } else {
      return puppeteerCoreLaunch({ ...options, executablePath, args });
    }
  }

  return {
    async start(_config) {
      config = _config;

      browser = await launchBrowser();
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

    async startDebugSession(session) {
      if (debugBrowser?.isConnected()) {
        await debugBrowser.close();
      }
      debugBrowser = await launchBrowser({ devtools: true });
      const page = await debugBrowser.newPage();
      await page.goto(`${createUrl(session)}&${PARAM_DEBUG}=true`);
    },
  };
}
