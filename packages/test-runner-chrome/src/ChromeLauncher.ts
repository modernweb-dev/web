import * as puppeteerCore from 'puppeteer-core';
import {
  Browser,
  Page,
  PuppeteerNodeLaunchOptions,
  launch as puppeteerCoreLaunch,
  BrowserContext,
} from 'puppeteer-core';
import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { findExecutablePath } from './findExecutablePath';
import { ChromeLauncherPage } from './ChromeLauncherPage';

function capitalize(str: string) {
  return `${str[0].toUpperCase()}${str.substring(1)}`;
}

const errorHelp =
  'This could be because of a mismatch between the version of puppeteer and Chrome or Chromium. ' +
  'Try updating either of them, or adjust the executablePath option to point to another browser installation. ' +
  'Use the --puppeteer flag to run tests with bundled compatible version of Chromium.';

interface CreateArgs {
  browser: Browser;
  config: TestRunnerCoreConfig;
}

export type CreateBrowserContextFn = (args: CreateArgs) => BrowserContext | Promise<BrowserContext>;
export type CreatePageFn = (args: CreateArgs & { context: BrowserContext }) => Promise<Page>;

export class ChromeLauncher implements BrowserLauncher {
  public name: string;
  public type = 'puppeteer';
  public concurrency?: number;
  private launchOptions: PuppeteerNodeLaunchOptions;
  private customPuppeteer?: typeof puppeteerCore;
  private createBrowserContextFn: CreateBrowserContextFn;
  private createPageFn: CreatePageFn;
  private config?: TestRunnerCoreConfig;
  private testFiles?: string[];
  private browser?: Browser;
  private browserContext?: BrowserContext;
  private debugBrowser?: Browser;
  private debugBrowserContext?: BrowserContext;
  private cachedExecutablePath?: string;
  private activePages = new Map<string, ChromeLauncherPage>();
  private activeDebugPages = new Map<string, ChromeLauncherPage>();
  private inactivePages: ChromeLauncherPage[] = [];
  private __startBrowserPromise?: Promise<{ browser: Browser; context: BrowserContext }>;

  constructor(
    launchOptions: PuppeteerNodeLaunchOptions,
    createBrowserContextFn: CreateBrowserContextFn,
    createPageFn: CreatePageFn,
    customPuppeteer?: typeof puppeteerCore,
    concurrency?: number,
  ) {
    this.launchOptions = launchOptions;
    this.customPuppeteer = customPuppeteer;
    this.createBrowserContextFn = createBrowserContextFn;
    this.createPageFn = createPageFn;
    this.concurrency = concurrency;

    if (!customPuppeteer) {
      // without a custom puppeteer, we use the locally installed chrome
      this.name = 'Chrome';
    } else if (!this.launchOptions?.product || this.launchOptions.product === 'chrome') {
      // with puppeteer we use the a packaged chromium, puppeteer calls it chrome but we
      // should call it chromium to avoid confusion
      this.name = 'Chromium';
    } else {
      // otherwise take the product name directly
      this.name = capitalize(this.launchOptions.product);
    }
  }

  async initialize(config: TestRunnerCoreConfig, testFiles: string[]) {
    this.config = config;
    this.testFiles = testFiles;
  }

  launchBrowser(options: PuppeteerNodeLaunchOptions = {}) {
    if (this.customPuppeteer) {
      const mergedOptions = { ...this.launchOptions, ...options };
      // launch using a custom puppeteer instance
      return this.customPuppeteer.launch(mergedOptions).catch(error => {
        if (mergedOptions.product === 'firefox') {
          console.warn(
            '\nUsing puppeteer with firefox is experimental.\n' +
              'Check the docs at https://github.com/modernweb-dev/web/tree/master/packages/test-runner-puppeteer' +
              ' to learn how to set it up.\n',
          );
        }
        throw error;
      });
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

  async startBrowser(options: PuppeteerNodeLaunchOptions = {}) {
    const browser = await this.launchBrowser(options);
    const context = await this.createBrowserContextFn({ config: this.config!, browser });
    return { browser, context };
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
    const { browser, context } = await this.getOrStartBrowser();

    let page: ChromeLauncherPage;
    if (this.inactivePages.length === 0) {
      page = await this.createNewPage(browser, context);
    } else {
      page = this.inactivePages.pop()!;
    }

    this.activePages.set(sessionId, page);
    await page.runSession(url, !!this.config?.coverage);
  }

  isActive(sessionId: string) {
    return this.activePages.has(sessionId);
  }

  getBrowserUrl(sessionId: string) {
    return this.getPage(sessionId).url();
  }

  async startDebugSession(sessionId: string, url: string) {
    if (!this.debugBrowser || !this.debugBrowserContext) {
      this.debugBrowser = await this.launchBrowser({ devtools: true });
      this.debugBrowserContext = await this.createBrowserContextFn({
        config: this.config!,
        browser: this.debugBrowser,
      });
    }

    const page = await this.createNewPage(this.debugBrowser, this.debugBrowserContext);
    this.activeDebugPages.set(sessionId, page);
    page.puppeteerPage.on('close', () => {
      this.activeDebugPages.delete(sessionId);
    });
    await page.runSession(url, true);
  }

  async createNewPage(browser: Browser, context: BrowserContext) {
    const puppeteerPagePromise = this.createPageFn({
      config: this.config!,
      browser,
      context,
    }).catch(error => {
      if (!this.customPuppeteer) {
        console.error(`Failed to create page with puppeteer. ${errorHelp}`);
      }
      throw error;
    });

    return new ChromeLauncherPage(
      this.config!,
      this.testFiles!,
      this.launchOptions?.product ?? 'chromium',
      await puppeteerPagePromise,
    );
  }

  async stopSession(sessionId: string) {
    const page = this.activePages.get(sessionId);
    if (!page) {
      throw new Error(`No page for session ${sessionId}`);
    }
    if (page.puppeteerPage.isClosed()) {
      throw new Error(`Session ${sessionId} is already stopped`);
    }

    const result = await page.stopSession();
    this.activePages.delete(sessionId);
    this.inactivePages.push(page);
    return result;
  }

  private async getOrStartBrowser(): Promise<{ browser: Browser; context: BrowserContext }> {
    if (this.__startBrowserPromise) {
      return this.__startBrowserPromise;
    }

    if (!this.browser || !this.browser?.isConnected() || !this.browserContext) {
      this.__startBrowserPromise = this.startBrowser();
      const { browser, context } = await this.__startBrowserPromise;
      this.browser = browser;
      this.browserContext = context;
      this.__startBrowserPromise = undefined;
    }
    return { browser: this.browser, context: this.browserContext };
  }

  getPage(sessionId: string) {
    const page =
      this.activePages.get(sessionId)?.puppeteerPage ??
      this.activeDebugPages.get(sessionId)?.puppeteerPage;

    if (!page) {
      throw new Error(`Could not find a page for session ${sessionId}`);
    }

    return page;
  }
}
