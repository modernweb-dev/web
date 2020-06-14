import { BrowserLauncher } from '@web/test-runner-core';
import { Builder, WebDriver } from 'selenium-webdriver';

export interface SeleniumLauncherArgs {
  driverBuilder: Builder;
}

export function seleniumLauncher(args: SeleniumLauncherArgs): BrowserLauncher {
  if (!args?.driverBuilder) {
    throw new Error(`Selenium launcher requires a driverBuilder property.`);
  }

  if (!(args?.driverBuilder instanceof Builder)) {
    throw new Error(`driverBuild must be a Builder`);
  }

  const activePages = new Map<string, string>();
  const inactivePages: string[] = [];
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

    async startSession(session, url) {
      if (!driver) {
        throw new Error('Browser is closed');
      }

      let page: string;
      if (inactivePages.length === 0) {
        await driver.executeScript(`window.open('')`);
        const pages = await driver.getAllWindowHandles();
        page = pages[pages.length - 1];
      } else {
        page = inactivePages.pop()!;
      }

      activePages.set(session.id, page);
      await driver.switchTo().window(page);
      await driver.navigate().to(url);
    },

    stopSession(session) {
      const page = activePages.get(session.id);
      if (page) {
        activePages.delete(session.id);
        inactivePages.push(page);
      }
    },

    async startDebugSession(session, url) {
      if (debugDriver) {
        await debugDriver.quit();
      }
      debugDriver = await args.driverBuilder.build();
      await debugDriver.navigate().to(url);
    },
  };
}
