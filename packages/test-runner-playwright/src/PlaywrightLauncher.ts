import playwright, { Browser, Page, LaunchOptions } from 'playwright';
import { BrowserLauncher, TestRunnerCoreConfig, CoverageMapData } from '@web/test-runner-core';
import { PlaywrightLauncherPage } from './PlaywrightLauncherPage';

function capitalize(str: string) {
  return `${str[0].toUpperCase()}${str.substring(1)}`;
}

export type ProductType = 'chromium' | 'firefox' | 'webkit';

export type CreatePageFunction = (args: {
  config: TestRunnerCoreConfig;
  browser: Browser;
}) => Promise<Page>;

export class PlaywrightLauncher implements BrowserLauncher {
  public name: string;
  public type = 'playwright';
  private config?: TestRunnerCoreConfig;
  private testFiles?: string[];
  private browser?: Browser;
  private debugBrowser?: Browser;
  private activePages = new Map<string, PlaywrightLauncherPage>();
  private activeDebugPages = new Map<string, PlaywrightLauncherPage>();
  private inactivePages: PlaywrightLauncherPage[] = [];
  private testCoveragePerSession = new Map<string, CoverageMapData>();
  private __launchBrowserPromise?: Promise<Browser>;

  constructor(
    private product: ProductType,
    private launchOptions: LaunchOptions,
    private createPageFunction?: CreatePageFunction,
  ) {
    this.name = capitalize(product);
  }

  async initialize(config: TestRunnerCoreConfig, testFiles: string[]) {
    this.config = config;
    this.testFiles = testFiles;
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
    const browser = await this.getOrStartBrowser();

    let page: PlaywrightLauncherPage;
    if (this.inactivePages.length === 0) {
      page = await this.createNewPage(browser);
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

  getBrowserUrl(sessionId: string) {
    return this.getPage(sessionId).url();
  }

  async startDebugSession(sessionId: string, url: string) {
    if (!this.debugBrowser) {
      this.debugBrowser = await playwright[this.product].launch({
        ...this.launchOptions,
        // devtools is only supported on chromium
        devtools: this.product === 'chromium',
        headless: false,
      });
    }

    const page = await this.createNewPage(this.debugBrowser);
    this.activeDebugPages.set(sessionId, page);
    page.playwrightPage.on('close', () => {
      this.activeDebugPages.delete(sessionId);
    });
    await page.runSession(url, false);
  }

  async createNewPage(browser: Browser) {
    const playwrightPage = await (this.createPageFunction
      ? this.createPageFunction({ config: this.config!, browser })
      : browser.newPage());
    return new PlaywrightLauncherPage(this.config!, this.testFiles!, playwrightPage);
  }

  async stopSession(sessionId: string) {
    const page = this.activePages.get(sessionId);
    if (!page) {
      throw new Error(`No page for session ${sessionId}`);
    }
    if (page.playwrightPage.isClosed()) {
      throw new Error(`Session ${sessionId} is already stopped`);
    }

    const result = await page.stopSession();
    this.activePages.delete(sessionId);
    this.inactivePages.push(page);
    return result;
  }

  private async getOrStartBrowser(): Promise<Browser> {
    if (this.__launchBrowserPromise) {
      return this.__launchBrowserPromise;
    }

    if (!this.browser || !this.browser?.isConnected()) {
      this.__launchBrowserPromise = playwright[this.product].launch(this.launchOptions);
      this.browser = await this.__launchBrowserPromise;
      this.__launchBrowserPromise = undefined;
    }
    return this.browser;
  }

  getPage(sessionId: string) {
    const page =
      this.activePages.get(sessionId)?.playwrightPage ??
      this.activeDebugPages.get(sessionId)?.playwrightPage;

    if (!page) {
      throw new Error(`Could not find a page for session ${sessionId}`);
    }

    return page;
  }
}
