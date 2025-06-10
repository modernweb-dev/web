import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { Browser } from 'webdriverio';
import { validateBrowserResult } from './coverage.js';

/**
 * Manages tests to be executed in one session (concurrency: 1).
 */
export class SessionManager {
  private config: TestRunnerCoreConfig;
  private driver: Browser;
  private locked?: Promise<unknown>;
  private isIE: boolean;
  private urlMap = new Map<string, string>();

  constructor(config: TestRunnerCoreConfig, driver: Browser, isIE: boolean) {
    this.config = config;
    this.driver = driver;
    this.isIE = isIE;
  }

  isActive(id: string) {
    return this.urlMap.has(id);
  }

  async getBrowserUrl(id: string): Promise<string | undefined> {
    return this.urlMap.get(id);
  }

  private async scheduleCommand<T>(fn: () => Promise<T>) {
    if (!this.isIE) {
      return fn();
    }

    while (this.locked) {
      await this.locked;
    }

    const fnPromise = fn();
    this.locked = fnPromise;
    const result = await fnPromise;
    this.locked = undefined;
    return result;
  }

  async queueStartSession(id: string, url: string) {
    this.scheduleCommand(() => this.startSession(id, url));
  }

  private async startSession(id: string, url: string) {
    this.urlMap.set(id, url);
    await this.driver.navigateTo(url);
  }

  async queueStopSession(id: string) {
    return this.scheduleCommand(() => this.stopSession(id));
  }

  async stopSession(id: string) {
    // Retrieve test results from iframe. Note: IIFE is used to prevent
    // WebdriverIO from crashing failure with Puppeteer (default mode):
    // Error: Evaluation failed: SyntaxError: Illegal return statement
    // See https://github.com/webdriverio/webdriverio/pull/4829
    const returnValue = await this.driver.execute(`
      return (function() {
        return { testCoverage: window.__coverage__ };
      })();
    `);

    if (!validateBrowserResult(returnValue)) {
      throw new Error();
    }

    const { testCoverage } = returnValue;

    // navigate to an empty page to kill any running code on the page
    await this.driver.navigateTo('about:blank');

    this.urlMap.delete(id);

    return { testCoverage: this.config.coverage ? testCoverage : undefined };
  }

  async performActions(_: string, actions: object[]) {
    return this.driver.performActions(actions);
  }

  async sendKeys(_: string, keys: string[]) {
    return this.driver.keys(keys);
  }

  async takeScreenshot(_: string, locator: string): Promise<Buffer> {
    const elementData = (await this.driver.execute(locator, [])) as WebdriverIO.Element;

    const element = await this.driver.$(elementData).getElement();

    let base64 = '';

    try {
      base64 = await this.driver.takeElementScreenshot(element.elementId);
    } catch (err) {
      console.log('Failed to take a screenshot:', err);
    }

    return Buffer.from(base64, 'base64');
  }
}
