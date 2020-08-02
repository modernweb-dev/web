import playwright, { Browser, Page, LaunchOptions } from 'playwright';
import {
  BrowserLauncher,
  TestRunnerCoreConfig,
  Viewport,
  CoverageMapData,
} from '@web/test-runner-core';
import { PlaywrightLauncherPage } from './PlaywrightLauncherPage';

export type ProductType = 'chromium' | 'firefox' | 'webkit';

export type CreatePageFunction = (args: {
  config: TestRunnerCoreConfig;
  browser: Browser;
}) => Promise<Page>;

export class PlaywrightLauncher implements BrowserLauncher {
  private config?: TestRunnerCoreConfig;
  private testFiles?: string[];
  private browser?: Browser;
  private debugBrowser?: Browser;
  private activePages = new Map<string, PlaywrightLauncherPage>();
  private activeDebugPages = new Map<string, PlaywrightLauncherPage>();
  private inactivePages: PlaywrightLauncherPage[] = [];
  private testCoveragePerSession = new Map<string, CoverageMapData>();

  constructor(
    private product: ProductType,
    private launchOptions: LaunchOptions,
    private createPageFunction?: CreatePageFunction,
  ) {}

  async start(config: TestRunnerCoreConfig, testFiles: string[]) {
    this.config = config;
    this.testFiles = testFiles;
    this.browser = await playwright[this.product].launch(this.launchOptions);
    return `${this.product[0].toUpperCase()}${this.product.substring(1)}`;
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

    let page: PlaywrightLauncherPage;
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
    return (page! || debugPage!).playwrightPage.setViewportSize(viewport);
  }
}
