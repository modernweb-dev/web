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

  async stopSession(id: string) {
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
  }

  private async createiframeManager() {
    if (!this.config) throw new Error('Not initialized');

    this.driver = await this.driverBuilder.build();
    this.iframeManager = new IFrameManager(this.config, this.driver, this.isIE);

    return this.iframeManager;
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
