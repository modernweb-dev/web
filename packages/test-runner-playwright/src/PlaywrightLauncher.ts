import playwright, { Browser, Page, LaunchOptions } from 'playwright';
import {
  BrowserLauncher,
  TestRunnerCoreConfig,
  TestSession,
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
  private testCoveragePerSession = new WeakMap<TestSession, CoverageMapData>();

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

  async startSession(session: TestSession, url: string) {
    if (!this.browser?.isConnected()) {
      throw new Error('Browser is closed');
    }

    let page: PlaywrightLauncherPage;
    if (this.inactivePages.length === 0) {
      page = await this.createNewPage(this.browser);
    } else {
      page = this.inactivePages.pop()!;
    }

    this.activePages.set(session.id, page);
    this.testCoveragePerSession.delete(session);
    await page.runSession(url, !!this.config?.coverage);
  }

  isActive(session: TestSession) {
    return this.activePages.has(session.id);
  }

  async startDebugSession(session: TestSession, url: string) {
    if (!this.debugBrowser) {
      this.debugBrowser = await playwright[this.product].launch({
        ...this.launchOptions,
        // devtools is only supported on chromium
        devtools: this.product === 'chromium',
        headless: false,
      });
    }

    const page = await this.createNewPage(this.debugBrowser);
    this.activeDebugPages.set(session.id, page);
    page.playwrightPage.on('close', () => {
      this.activeDebugPages.delete(session.id);
    });
    await page.runSession(url, false);
  }

  async createNewPage(browser: Browser) {
    const playwrightPage = await (this.createPageFunction
      ? this.createPageFunction({ config: this.config!, browser })
      : browser.newPage());
    return new PlaywrightLauncherPage(this.config!, this.testFiles!, playwrightPage);
  }

  async stopSession(session: TestSession) {
    const page = this.activePages.get(session.id);

    if (page) {
      const result = await page.stopSession();
      this.activePages.delete(session.id);
      this.inactivePages.push(page);
      return result;
    } else {
      throw new Error(`No page for session ${session.id}`);
    }
  }

  setViewport(session: TestSession, viewport: Viewport) {
    const page = this.activePages.get(session.id);
    const debugPage = this.activeDebugPages.get(session.id);
    if (!page && !debugPage) {
      throw new Error(`Cannot set viewport for inactive session: ${session.id}`);
    }
    return (page! || debugPage!).playwrightPage.setViewportSize(viewport);
  }
}
