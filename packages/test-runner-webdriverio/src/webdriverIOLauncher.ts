import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { remote, BrowserObject, RemoteOptions } from 'webdriverio';
import { IFrameManager } from './IFrameManager';
import { getBrowserLabel } from './utils';

export class WebdriverIOLauncher implements BrowserLauncher {
  public name = 'Initializing...';
  public type = 'wdio';
  private config?: TestRunnerCoreConfig;
  private driver?: BrowserObject;
  private debugDriver: undefined | BrowserObject = undefined;
  private iframeManager?: IFrameManager;
  private __iframeManagerPromise?: Promise<IFrameManager>;
  private isIE = false;

  constructor(private options: RemoteOptions) {}

  async initialize(config: TestRunnerCoreConfig) {
    this.config = config;

    const options: RemoteOptions = { logLevel: 'error', ...this.options };

    try {
      this.driver = await remote(options);
    } catch (e) {
      this.stop();
      throw e;
    }

    const cap = this.driver.capabilities;
    this.name = getBrowserLabel(cap);
    const browserName = cap.browserName?.toLowerCase().replace(/_/g, ' ') || '';
    this.isIE =
      (browserName.includes('internet') && browserName.includes('explorer')) ||
      browserName === 'ie' ||
      browserName === 'ie11';
  }

  async stop() {
    try {
      await this.driver?.deleteSession();
      await this.debugDriver?.deleteSession();

      this.driver = undefined;
      this.debugDriver = undefined;
      this.iframeManager = undefined;
    } catch {
      //
    }
  }

  async startSession(id: string, url: string) {
    await this.ensureIframeManagerInitialized();
    return this.iframeManager!.queueStartSession(id, url);
  }

  isActive(id: string) {
    return !!this.iframeManager?.isActive(id);
  }

  getBrowserUrl(sessionId: string) {
    if (!this.iframeManager) {
      throw new Error('Not initialized');
    }
    return this.iframeManager.getBrowserUrl(sessionId);
  }

  async stopSession(id: string) {
    return this.iframeManager!.queueStopSession(id);
  }

  async startDebugSession(_: string, url: string) {
    if (this.debugDriver) {
      await this.debugDriver.deleteSession();
    }
    this.debugDriver = await remote(this.options);
    await this.debugDriver.navigateTo(url);
  }

  private async ensureIframeManagerInitialized(): Promise<void> {
    if (this.iframeManager) {
      return;
    }

    if (this.__iframeManagerPromise) {
      await this.__iframeManagerPromise;
      return;
    }

    this.__iframeManagerPromise = this.createIframeManager();
    await this.__iframeManagerPromise;
    this.__iframeManagerPromise = undefined;
  }

  private async createIframeManager() {
    if (!this.config || !this.driver) throw new Error('Not initialized');

    this.iframeManager = new IFrameManager(this.config, this.driver, this.isIE);

    return this.iframeManager;
  }
}

export function webdriverIOLauncher(options: RemoteOptions) {
  if (!options?.capabilities) {
    throw new Error(`WebdriverIO launcher requires a capabilities property.`);
  }

  return new WebdriverIOLauncher(options);
}
