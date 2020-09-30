import {
  CoverageMapData,
  TestResultError,
  getBrowserPageNavigationError,
  TestRunnerCoreConfig,
} from '@web/test-runner-core';
import { WebDriver } from 'selenium-webdriver';

interface BrowserResult {
  testCoverage?: CoverageMapData;
  url: string;
}

function validateBrowserResult(result: any): result is BrowserResult {
  if (typeof result !== 'object') throw new Error('Browser did not return an object');
  if (typeof result.url !== 'string') throw new Error('Browser did not return a url');
  if (result.testCoverage != null && typeof result.testCoverage !== 'object')
    throw new Error('Browser returned non-object testCoverage');

  return true;
}

/**
 * Manages tests to be excuted in iframes on a page.
 */
export class IFrameManager {
  private config: TestRunnerCoreConfig;
  private driver: WebDriver;
  private framePerSession = new Map<string, string>();
  private urlPerSession = new Map<string, string>();
  private inactiveFrames: string[] = [];
  private frameCount = 0;
  private initialized = false;
  private initializePromise?: Promise<void>;
  private locked?: Promise<unknown>;
  private isIE: boolean;

  constructor(config: TestRunnerCoreConfig, driver: WebDriver, isIE: boolean) {
    this.config = config;
    this.driver = driver;
    this.isIE = isIE;
  }

  private async _initialize(url: string) {
    const pageUrl = `${new URL(url).origin}/?mode=iframe`;
    await this.driver.navigate().to(pageUrl);
  }

  isActive(id: string) {
    return this.framePerSession.has(id);
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
    if (!this.initializePromise && !this.initialized) {
      this.initializePromise = this._initialize(url);
    }

    if (this.initializePromise) {
      await this.initializePromise;
      this.initializePromise = undefined;
      this.initialized = true;
    }

    this.scheduleCommand(() => this.startSession(id, url));
  }

  private async startSession(id: string, url: string) {
    this.urlPerSession.set(id, url);

    let frameId: string;
    if (this.inactiveFrames.length > 0) {
      frameId = this.inactiveFrames.pop()!;
      await this.driver.executeScript(`
        var iframe = document.getElementById("${frameId}");
        iframe.src = "${url}";
      `);
    } else {
      this.frameCount += 1;
      frameId = `wtr-test-frame-${this.frameCount}`;
      await this.driver.executeScript(`
        var iframe = document.createElement("iframe");
        iframe.id = "${frameId}";
        iframe.src = "${url}";
        document.body.appendChild(iframe);
      `);
    }

    this.framePerSession.set(id, frameId);
  }

  async queueStopSession(id: string) {
    return this.scheduleCommand(() => this.stopSession(id));
  }

  async stopSession(id: string) {
    const frameId = this.framePerSession.get(id);
    this.framePerSession.delete(id);
    if (!frameId) {
      throw new Error(
        `Something went wrong while running tests, there is no window handle for session ${id}`,
      );
    }

    const errors: TestResultError[] = [];
    const testUrl = this.urlPerSession.get(id) as string;

    // retreive test results from iframe
    const returnValue = await this.driver.executeScript(`
      var iframe = document.getElementById("${frameId}");
      var w = iframe.contentWindow;
      var returnValue = { testCoverage: w.__coverage__, url: w.location.href };
      // set src after retreiving values to avoid the iframe from navigating away
      iframe.src = "data:,";
      return returnValue;
    `);

    if (!validateBrowserResult(returnValue)) {
      throw new Error();
    }

    const { url: actualUrl, testCoverage } = returnValue;
    if (testUrl !== actualUrl) {
      // the page was navigated, resulting in broken tests
      const testUrlObject = new URL(testUrl);
      // we can't track page reload in selenium, we can only check if the user navigated to another page
      // we fake the navigation array, in puppeteer or playwright we would build an actual history
      const navigations = [testUrlObject, new URL(actualUrl)];
      const error = getBrowserPageNavigationError(testUrlObject, navigations);
      if (error) {
        errors.push(error);
      }
    }

    this.inactiveFrames.push(frameId);
    return { testCoverage: this.config.coverage ? testCoverage : undefined, errors: [] };
  }
}
