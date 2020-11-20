import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { Builder, WebDriver } from 'selenium-webdriver';
import { getBrowserLabel, getBrowserName } from './utils';
import { IFrameManager } from './IFrameManager';

export interface SeleniumLauncherArgs {
  driverBuilder: Builder;
}

export class SeleniumLauncher implements BrowserLauncher {
  public name = 'Initializing...';
  public type = 'selenium';
  private config?: TestRunnerCoreConfig;
  private driver?: WebDriver;
  private debugDriver: undefined | WebDriver = undefined;
  private iframeManager?: IFrameManager;
  private __iframeManagerPromise?: Promise<IFrameManager>;
  private isIE = false;
  private pendingHeartbeat!: ReturnType<typeof setInterval>;

  constructor(private driverBuilder: Builder) {}

  async initialize(config: TestRunnerCoreConfig) {
    this.config = config;
    const cap = this.driverBuilder.getCapabilities();

    this.driverBuilder.withCapabilities(cap);
    this.name = getBrowserLabel(cap);
    const browserName = getBrowserName(cap).toLowerCase().replace(/_/g, ' ');
    this.isIE =
      (browserName.includes('internet') && browserName.includes('explorer')) ||
      browserName === 'ie' ||
      browserName === 'ie11';
  }

  async stop() {
    try {
      await this.driver?.quit();
      await this.debugDriver?.quit();

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
    // If there is still pending heartbeat, clear the timeout
    if (this.pendingHeartbeat) {
      clearInterval(this.pendingHeartbeat);
    }
    return this.iframeManager!.queueStopSession(id);
  }

  async startDebugSession(_: string, url: string) {
    if (this.debugDriver) {
      await this.debugDriver.quit();
    }
    this.debugDriver = await this.driverBuilder.build();
    await this.debugDriver.navigate().to(url);
  }

  private async ensureIframeManagerInitialized(): Promise<void> {
    if (this.iframeManager) {
      return;
    }

    if (this.__iframeManagerPromise) {
      await this.__iframeManagerPromise;
      return;
    }

    this.__iframeManagerPromise = this.createiframeManager();
    await this.__iframeManagerPromise;
    this.__iframeManagerPromise = undefined;

    this.heartbeat();
  }

  private async createiframeManager() {
    if (!this.config) throw new Error('Not initialized');

    this.driver = await this.driverBuilder.build();
    this.iframeManager = new IFrameManager(this.config, this.driver, this.isIE);

    return this.iframeManager;
  }

  private heartbeat() {
    // Heartbeat function to keep alive sessions on Sauce Labs via WebDriver calls
    this.pendingHeartbeat = setInterval(async () => {
      if (!this.driver) {
        return;
      }
      try {
        await this.driver.getTitle();
      } catch (e) {
        // Do nothing, just clear the timeout
        clearInterval(this.pendingHeartbeat);
      }
      return;
    }, 60000);
  }
}

export function seleniumLauncher(args: SeleniumLauncherArgs) {
  if (!args?.driverBuilder) {
    throw new Error(`Selenium launcher requires a driverBuilder property.`);
  }

  if (!(args?.driverBuilder instanceof Builder)) {
    throw new Error(`driverBuild must be a Builder`);
  }

  return new SeleniumLauncher(args.driverBuilder);
}
