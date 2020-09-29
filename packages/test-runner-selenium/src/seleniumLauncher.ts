import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { Builder, WebDriver } from 'selenium-webdriver';
import { getBrowserLabel, getBrowserName } from './utils';
import { IFrameManager } from './IFrameManager';
import { WindowManager } from './WindowManager';

export interface SeleniumLauncherArgs {
  driverBuilder: Builder;
  experimentalIframeMode?: boolean;
}

export class SeleniumLauncher implements BrowserLauncher {
  public name = 'Initializing...';
  public type = 'selenium';
  private config?: TestRunnerCoreConfig;
  private driver?: WebDriver;
  private debugDriver: undefined | WebDriver = undefined;
  private windowManager?: IFrameManager | WindowManager;
  private __windowManagerPromise?: Promise<IFrameManager | WindowManager>;
  private experimentalIframeMode: boolean;
  private isIE = false;

  constructor(private driverBuilder: Builder, experimentalIframeMode?: boolean) {
    this.experimentalIframeMode = !!experimentalIframeMode;
  }

  async initialize(config: TestRunnerCoreConfig) {
    this.config = config;
    const cap = this.driverBuilder.getCapabilities();
    if (!this.experimentalIframeMode) {
      cap.setPageLoadStrategy('none');
    }
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
      this.windowManager = undefined;
    } catch {
      //
    }
  }

  async startSession(id: string, url: string) {
    await this.ensureWindowManagerInitialized();
    return this.windowManager!.queueStartSession(id, url);
  }

  isActive(id: string) {
    return !!this.windowManager?.isActive(id);
  }

  async stopSession(id: string) {
    return this.windowManager!.queueStopSession(id);
  }

  async startDebugSession(_: string, url: string) {
    if (this.debugDriver) {
      await this.debugDriver.quit();
    }
    this.debugDriver = await this.driverBuilder.build();
    await this.debugDriver.navigate().to(url);
  }

  private async ensureWindowManagerInitialized(): Promise<void> {
    if (this.windowManager) {
      return;
    }

    if (this.__windowManagerPromise) {
      await this.__windowManagerPromise;
      return;
    }

    this.__windowManagerPromise = this.createWindowManager();
    await this.__windowManagerPromise;
    this.__windowManagerPromise = undefined;
  }

  private async createWindowManager() {
    if (!this.config) throw new Error('Not initialized');

    this.driver = await this.driverBuilder.build();
    this.windowManager = this.experimentalIframeMode
      ? new IFrameManager(this.config, this.driver, this.isIE)
      : new WindowManager(this.driver, this.config);

    await this.windowManager.initialize();
    return this.windowManager;
  }
}

export function seleniumLauncher(args: SeleniumLauncherArgs) {
  if (!args?.driverBuilder) {
    throw new Error(`Selenium launcher requires a driverBuilder property.`);
  }

  if (!(args?.driverBuilder instanceof Builder)) {
    throw new Error(`driverBuild must be a Builder`);
  }

  return new SeleniumLauncher(args.driverBuilder, args.experimentalIframeMode);
}
