import { TestSession } from '@web/test-runner-core';
import { Builder, WebDriver } from 'selenium-webdriver';

export interface SeleniumLauncherArgs {
  driverBuilder: Builder;
}

export function seleniumLauncher(args: SeleniumLauncherArgs) {
  if (!args?.driverBuilder) {
    throw new Error(`Selenium launcher requires a driverBuilder property.`);
  }

  if (!(args?.driverBuilder instanceof Builder)) {
    throw new Error(`driverBuild must be a Builder`);
  }

  const activePages = new Map<string, string>();
  const inactivePages: string[] = [];
  const sessionsQueue: { session: TestSession; url: string }[] = [];
  let runningQueuedSessions = false;
  let driver: undefined | WebDriver;
  let debugDriver: undefined | WebDriver = undefined;

  return {
    async start() {
      driver = await args.driverBuilder.build();
      const cap = await driver.getCapabilities();
      return [`${cap.getPlatform()} ${cap.getBrowserName()} ${cap.getBrowserVersion()}`];
    },

    async stop() {
      try {
        await driver?.quit();
        await debugDriver?.quit();

        driver = undefined;
        debugDriver = undefined;
      } catch {
        //
      }
    },

    async startSession(session: TestSession, url: string) {
      sessionsQueue.push({ session, url });
      if (runningQueuedSessions) {
        return;
      }

      return this._runQueuedSessions();
    },

    async _runQueuedSessions() {
      try {
        runningQueuedSessions = true;
        const next = sessionsQueue.shift();
        if (!next) {
          throw new Error('Did not find a next session to run');
        }

        if (!driver) {
          throw new Error('Browser is closed');
        }

        let page: string;
        if (inactivePages.length === 0) {
          const handlesBefore = await driver.getAllWindowHandles();
          await driver.executeScript(`window.open('')`);
          const handlesAfter = await driver.getAllWindowHandles();
          page = handlesAfter.find(h => !handlesBefore.includes(h))!;
          if (!page) {
            throw new Error('Selenium did not open a new browser window.');
          }
        } else {
          page = inactivePages.pop()!;
        }

        activePages.set(next.session.id, page);
        await driver.switchTo().window(page);
        await driver.navigate().to(next.url);
      } finally {
        if (sessionsQueue.length > 0) {
          await this._runQueuedSessions();
        } else {
          runningQueuedSessions = false;
        }
      }
    },

    stopSession(session: TestSession) {
      const page = activePages.get(session.id);
      if (page) {
        activePages.delete(session.id);
        inactivePages.push(page);
      }
    },

    async startDebugSession(session: TestSession, url: string) {
      if (debugDriver) {
        await debugDriver.quit();
      }
      debugDriver = await args.driverBuilder.build();
      await debugDriver.navigate().to(url);
    },
  };
}
