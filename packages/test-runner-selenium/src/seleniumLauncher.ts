import { TestSession } from '@web/test-runner-core';
import { Builder, WebDriver } from 'selenium-webdriver';

export interface SeleniumLauncherArgs {
  driverBuilder: Builder;
}

export class SeleniumLauncher {
  private activePages = new Map<string, string>();
  private inactivePages: string[] = [];
  private sessionsQueue: { session: TestSession; url: string }[] = [];
  private driver: undefined | WebDriver;
  private debugDriver: undefined | WebDriver = undefined;
  private currentSession: string | undefined;

  constructor(private driverBuilder: Builder) {}

  async start() {
    this.driver = await this.driverBuilder.build();

    const cap = await this.driver.getCapabilities();
    return [cap.getPlatform(), cap.getBrowserName(), cap.getBrowserVersion()]
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

  async startSession(session: TestSession, url: string) {
    this.sessionsQueue.push({ session, url });

    if (!this.currentSession) {
      return this._runNextQueuedSession();
    }
  }

  async _runNextQueuedSession() {
    const next = this.sessionsQueue.shift();
    if (!next) {
      return;
    }

    if (!this.driver) {
      throw new Error('Browser is closed');
    }

    this.currentSession = next.session.id;
    await this.driver.get(next.url);
  }

  stopSession(session: TestSession) {
    if (this.currentSession === session.id) {
      this.currentSession = undefined;
      this._runNextQueuedSession();
    }
  }

  async startDebugSession(session: TestSession, url: string) {
    if (this.debugDriver) {
      await this.debugDriver.quit();
    }
    this.debugDriver = await this.driverBuilder.build();
    await this.debugDriver.navigate().to(url);
  }

  setViewport() {
    throw new Error('Setting viewport is not supported in Selenium Browser Launcher.');
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
