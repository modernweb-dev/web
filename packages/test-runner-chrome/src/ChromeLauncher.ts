import * as puppeteerCore from 'puppeteer-core';
import { Browser, Page, LaunchOptions, launch as puppeteerCoreLaunch } from 'puppeteer-core';
import {
  BrowserLauncher,
  TestRunnerCoreConfig,
  Viewport,
  CoverageMapData,
} from '@web/test-runner-core';
import { findExecutablePath } from './findExecutablePath';
import { ChromeLauncherPage } from './ChromeLauncherPage';

function capitalize(str: string) {
  return `${str[0].toUpperCase()}${str.substring(1)}`;
}

const errorHelp =
  'This could be because of a mismatch between the version of puppeteer and Chrome or Chromium. ' +
  'Try updating either of them, or adjust the executablePath option to point to another browser installation. ' +
  'Use the --puppeteer flag to run tests with bundled compatible version of Chromium.';

export type CreatePageFunction = (args: {
  config: TestRunnerCoreConfig;
  browser: Browser;
}) => Promise<Page>;

export class ChromeLauncher implements BrowserLauncher {
  public name: string;
  private config?: TestRunnerCoreConfig;
  private testFiles?: string[];
  private browser?: Browser;
  private debugBrowser?: Browser;
  private cachedExecutablePath?: string;
  private activePages = new Map<string, ChromeLauncherPage>();
  private activeDebugPages = new Map<string, ChromeLauncherPage>();
  private inactivePages: ChromeLauncherPage[] = [];
  private testCoveragePerSession = new Map<string, CoverageMapData>();

  constructor(
    private launchOptions: LaunchOptions,
    private customPuppeteer?: typeof puppeteerCore,
    private createPageFunction?: CreatePageFunction,
  ) {
    if (!customPuppeteer) {
      // without a custom puppeteer, we use the locally installed chrome
      this.name = 'Chrome';
    } else if (!this.launchOptions.product || this.launchOptions.product === 'chrome') {
      // with puppeteer we use the a packaged chromium, puppeteer calls it chrome but we
      // should call it chromium to avoid confusion
      this.name = 'Chromium';
    } else {
      // otherwise take the product name directly
      this.name = capitalize(this.launchOptions.product);
    }
  }

  async start(config: TestRunnerCoreConfig, testFiles: string[]) {
    this.config = config;
    this.testFiles = testFiles;
    this.browser = await this.launchBrowser();
  }

  launchBrowser(options: LaunchOptions = {}) {
    if (this.customPuppeteer) {
      // launch using a custom puppeteer instance
      return this.customPuppeteer.launch({ ...this.launchOptions, ...options });
    }

    // launch using puppeteer-core, connecting to an installed browser
    const mergedOptions = { ...this.launchOptions, ...options };

    // add a default executable path if the user did not provide any
    if (!mergedOptions.executablePath) {
      if (!this.cachedExecutablePath) {
        this.cachedExecutablePath = findExecutablePath();
      }
      mergedOptions.executablePath = this.cachedExecutablePath;
    }
    return puppeteerCoreLaunch(mergedOptions).catch(error => {
      console.error('');
      console.error(
        `Failed to launch local browser installed at ${mergedOptions.executablePath}. ${errorHelp}`,
      );
      console.error('');
      throw error;
    });
  }

  async stop() {
    if (this.browser?.isConnected()) {
      await this.browser.close();
    }

    if (this.debugBrowser?.isConnected()) {
      await this.debugBrowser.close();
    }
  }

  async startSession(sessionId: string, url: string) {
    if (!this.browser?.isConnected()) {
      throw new Error('Browser is closed');
    }

    let page: ChromeLauncherPage;
    if (this.inactivePages.length === 0) {
      page = await this.createNewPage(this.browser);
    } else {
      page = this.inactivePages.pop()!;
    }

    this.activePages.set(sessionId, page);
    this.testCoveragePerSession.delete(sessionId);
    await page.runSession(url, !!this.config?.coverage);
  }

  isActive(sessionId: string) {
    return this.activePages.has(sessionId);
  }

  async startDebugSession(sessionId: string, url: string) {
    if (!this.debugBrowser) {
      this.debugBrowser = await this.launchBrowser({ devtools: true });
    }

    const page = await this.createNewPage(this.debugBrowser);
    this.activeDebugPages.set(sessionId, page);
    page.puppeteerPage.on('close', () => {
      this.activeDebugPages.delete(sessionId);
    });
    await page.runSession(url, false);
  }

  async createNewPage(browser: Browser) {
    const puppeteerPagePromise = (this.createPageFunction
      ? this.createPageFunction({ config: this.config!, browser })
      : browser.newPage()
    ).catch(error => {
      if (!this.customPuppeteer) {
        console.error(`Failed to create page with puppeteer. ${errorHelp}`);
      }
      throw error;
    });
    return new ChromeLauncherPage(this.config!, this.testFiles!, await puppeteerPagePromise);
  }

  async stopSession(sessionId: string) {
    const page = this.activePages.get(sessionId);

    if (page) {
      const result = await page.stopSession();
      this.activePages.delete(sessionId);
      this.inactivePages.push(page);
      return result;
    } else {
      throw new Error(`No page for session ${sessionId}`);
    }
  }

  setViewport(sessionId: string, viewport: Viewport) {
    const page = this.activePages.get(sessionId);
    const debugPage = this.activeDebugPages.get(sessionId);
    if (!page && !debugPage) {
      throw new Error(`Cannot set viewport for inactive session: ${sessionId}`);
    }
    return (page! || debugPage!).puppeteerPage.setViewport(viewport);
  }
}
