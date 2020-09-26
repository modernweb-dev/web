import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { SeleniumLauncher } from '@web/test-runner-selenium';
import webdriver, { Capabilities } from 'selenium-webdriver';
import ip from 'ip';
import { SauceLabsLauncherManager } from './SauceLabsLauncherManager';

const localIp = ip.address();

export class SauceLabsLauncher extends SeleniumLauncher {
  constructor(
    private manager: SauceLabsLauncherManager,
    public name: string,
    sauceLabsUrl: string,
    capabilities: Capabilities,
    experimentalIframeMode?: boolean,
  ) {
    super(
      new webdriver.Builder().usingServer(sauceLabsUrl).withCapabilities(capabilities),
      experimentalIframeMode,
    );
  }

  startSession(sessionId: string, url: string) {
    return super.startSession(sessionId, url.replace(/(localhost|127\.0\.0\.1)/, localIp));
  }

  async startDebugSession() {
    throw new Error('Starting a debug session is not supported in browserstack');
  }

  async start(config: TestRunnerCoreConfig) {
    await this.manager.registerLauncher(this);
    return super.start(config);
  }

  async stop() {
    await super.stop();
    await this.manager.deregisterLauncher(this);
  }
}
