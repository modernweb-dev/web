import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { remote, BrowserObject, RemoteOptions } from 'webdriverio';
import { IFrameManager } from './IFrameManager';
import { SessionManager } from './SessionManager';
import { getBrowserLabel } from './utils';

export class WebdriverIOLauncher implements BrowserLauncher {
  public name = 'Initializing...';
  public type = 'wdio';
  private config?: TestRunnerCoreConfig;
  private driver?: BrowserObject;
  private debugDriver: undefined | BrowserObject = undefined;
  private driverManager?: IFrameManager | SessionManager;
  private __managerPromise?: Promise<IFrameManager | SessionManager>;
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
      this.driverManager = undefined;
    } catch {
      //
    }
  }

  async startSession(id: string, url: string) {
    await this.ensureManagerInitialized();
    return this.driverManager!.queueStartSession(id, url);
  }

  isActive(id: string) {
    return !!this.driverManager?.isActive(id);
  }

  getBrowserUrl(sessionId: string) {
    if (!this.driverManager) {
      throw new Error('Not initialized');
    }
    return this.driverManager.getBrowserUrl(sessionId);
  }

  async stopSession(id: string) {
    return this.driverManager!.queueStopSession(id);
  }

  async startDebugSession(_: string, url: string) {
    if (this.debugDriver) {
      await this.debugDriver.deleteSession();
    }
    this.debugDriver = await remote(this.options);
    await this.debugDriver.navigateTo(url);
  }

  private async ensureManagerInitialized(): Promise<void> {
    if (this.driverManager) {
      return;
    }

    if (this.__managerPromise) {
      await this.__managerPromise;
      return;
    }

    this.__managerPromise = this.createDriverManager();
    await this.__managerPromise;
    this.__managerPromise = undefined;
  }

  private async createDriverManager() {
    if (!this.config || !this.driver) throw new Error('Not initialized');

    this.driverManager =
      this.config.concurrency === 1
        ? new SessionManager(this.config, this.driver, this.isIE)
        : new IFrameManager(this.config, this.driver, this.isIE);

    return this.driverManager;
  }
}

export function webdriverIOLauncher(options: RemoteOptions) {
  if (!options?.capabilities) {
    throw new Error(`WebdriverIO launcher requires a capabilities property.`);
  }

  return new WebdriverIOLauncher(options);
}
