import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { Builder, WebDriver } from 'selenium-webdriver';
import { getBrowserName } from './utils';
import { IFrameManager } from './IFrameManager';
import { WindowManager } from './WindowManager';

export interface SeleniumLauncherArgs {
  driverBuilder: Builder;
  experimentalIframeMode?: boolean;
}

export class SeleniumLauncher implements BrowserLauncher {
  public name = 'Initializing...';
  public type = 'selenium';
  private driver: undefined | WebDriver;
  private debugDriver: undefined | WebDriver = undefined;
  private windowManager?: IFrameManager | WindowManager;
  private experimentalIframeMode: boolean;

  constructor(private driverBuilder: Builder, experimentalIframeMode?: boolean) {
    this.experimentalIframeMode = !!experimentalIframeMode;
  }

  async start(config: TestRunnerCoreConfig) {
    const cap = this.driverBuilder.getCapabilities();
    if (!this.experimentalIframeMode) {
      cap.setPageLoadStrategy('none');
    }
    this.driverBuilder.withCapabilities(cap);
    this.driver = await this.driverBuilder.build();
    this.name = getBrowserName(cap);
    this.windowManager = this.experimentalIframeMode
      ? new IFrameManager(this.driver, config)
      : new WindowManager(this.driver, config);
    await this.windowManager.initialize();
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
    return this.windowManager!.queueStartSession(id, url);
  }

  isActive(id: string) {
    return this.windowManager!.isActive(id);
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
