import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { SeleniumLauncher } from '@web/test-runner-selenium';
import webdriver, { Capabilities } from 'selenium-webdriver';
import ip from 'ip';
import { SauceLabsLauncherManager } from './SauceLabsLauncherManager';

const networkAddress = ip.address();

export class SauceLabsLauncher extends SeleniumLauncher {
  constructor(
    private manager: SauceLabsLauncherManager,
    public name: string,
    sauceLabsUrl: string,
    capabilities: Capabilities,
  ) {
    super(new webdriver.Builder().usingServer(sauceLabsUrl).withCapabilities(capabilities));
  }

  startSession(sessionId: string, url: string) {
    return super.startSession(sessionId, url.replace(/(localhost|127\.0\.0\.1)/, networkAddress));
  }

  async startDebugSession() {
    throw new Error('Starting a debug session is not supported in browserstack');
  }

  async initialize(config: TestRunnerCoreConfig) {
    await this.manager.registerLauncher(this);
    return super.initialize(config);
  }

  stop() {
    const stopPromise = super.stop();
    this.manager.deregisterLauncher(this);
    return stopPromise;
  }
}
