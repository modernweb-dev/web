import { CoverageMapData, TestRunnerCoreConfig } from '@web/test-runner-core';

export interface BrowserResult {
  testCoverage?: CoverageMapData;
  url: string;
}

function validateBrowserResult(result: any): result is BrowserResult {
  if (typeof result !== 'object') throw new Error('Browser did not return an object');
  if (result.testCoverage != null && typeof result.testCoverage !== 'object')
    throw new Error('Browser returned non-object testCoverage');

  return true;
}

/**
 * Manages tests to be executed in iframes on a page.
 */
export abstract class IFrameManager {
  private config: TestRunnerCoreConfig;
  private framePerSession = new Map<string, string>();
  private inactiveFrames: string[] = [];
  private frameCount = 0;
  private initialized = false;
  private initializePromise?: Promise<void>;
  private locked?: Promise<unknown>;
  private isIE: boolean;

  abstract navigateTo(pageUrl: string): Promise<void>;

  abstract getIframeUrl(frameId: string): Promise<string | undefined>;

  abstract initIframe(frameId: string, url: string): Promise<void>;

  abstract attachToIframe(frameId: string, url: string): Promise<void>;

  abstract getTestCoverage(frameId: string): Promise<BrowserResult>;

  constructor(config: TestRunnerCoreConfig, isIE: boolean) {
    this.config = config;
    this.isIE = isIE;
  }

  private async _initialize(url: string) {
    const pageUrl = `${new URL(url).origin}/?mode=iframe`;
    await this.navigateTo(pageUrl);
  }

  isActive(id: string) {
    return this.framePerSession.has(id);
  }

  async getBrowserUrl(sessionId: string): Promise<string | undefined> {
    const frameId = this.getFrameId(sessionId);

    const returnValue = await this.getIframeUrl(frameId);

    return returnValue;
  }

  getFrameId(sessionId: string): string {
    const frameId = this.framePerSession.get(sessionId);
    if (!frameId) {
      throw new Error(
        `Something went wrong while running tests, there is no frame id for session ${sessionId}`,
      );
    }
    return frameId;
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
    let frameId: string;
    if (this.inactiveFrames.length > 0) {
      frameId = this.inactiveFrames.pop()!;
      await this.attachToIframe(frameId, url);
    } else {
      this.frameCount += 1;
      frameId = `wtr-test-frame-${this.frameCount}`;
      await this.initIframe(frameId, url);
    }

    this.framePerSession.set(id, frameId);
  }

  async queueStopSession(id: string) {
    return this.scheduleCommand(() => this.stopSession(id));
  }

  async stopSession(id: string) {
    const frameId = this.getFrameId(id);

    const returnValue = await this.getTestCoverage(frameId);

    if (!validateBrowserResult(returnValue)) {
      throw new Error();
    }

    const { testCoverage } = returnValue;

    this.inactiveFrames.push(frameId);

    return { testCoverage: this.config.coverage ? testCoverage : undefined };
  }
}
