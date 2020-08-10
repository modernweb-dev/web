import { BrowserLauncher, CoverageMapData, TestRunnerCoreConfig } from '@web/test-runner-core';
import { Builder, WebDriver } from 'selenium-webdriver';

export interface SeleniumLauncherArgs {
  driverBuilder: Builder;
}

export class SeleniumLauncher implements BrowserLauncher {
  public name = 'Initializing...';
  public type = 'selenium';
  private sessionsQueue: { sessionId: string; url: string }[] = [];
  private driver: undefined | WebDriver;
  private debugDriver: undefined | WebDriver = undefined;
  private currentSession: string | undefined;
  private config: TestRunnerCoreConfig | undefined;

  constructor(private driverBuilder: Builder) {}

  async start(config: TestRunnerCoreConfig) {
    this.config = config;
    this.driver = await this.driverBuilder.build();
    const cap = await this.driver.getCapabilities();
    this.name = [cap.getPlatform(), cap.getBrowserName(), cap.getBrowserVersion()]
      .filter(_ => _)
      .join(' ');
  }

  async stop() {
    try {
      await this.driver?.quit();
      await this.debugDriver?.quit();

      this.driver = undefined;
      this.debugDriver = undefined;
    } catch {
      //
    }
  }

  async startSession(sessionId: string, url: string) {
    this.sessionsQueue.push({ sessionId, url });

    if (!this.currentSession) {
      return this._runNextQueuedSession();
    }
  }

  isActive(sessionId: string) {
    return this.currentSession === sessionId;
  }

  async _runNextQueuedSession() {
    const next = this.sessionsQueue.shift();
    if (!next) {
      return;
    }

    if (!this.driver) {
      throw new Error('Browser is closed');
    }

    this.currentSession = next.sessionId;
    await this.driver.get(next.url);
  }

  async stopSession(sessionId: string) {
    if (this.currentSession === sessionId) {
      this.currentSession = undefined;
      this._runNextQueuedSession();
    }

    let testCoverage: CoverageMapData | undefined = undefined;

    if (this.config?.coverage) {
      testCoverage = await this.driver?.executeScript<CoverageMapData>(function () {
        return (window as any).__coverage__;
      });
    }

    return { browserLogs: [], testCoverage };
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

  return new SeleniumLauncher(args.driverBuilder);
}
