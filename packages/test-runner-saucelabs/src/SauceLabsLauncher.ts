import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { RemoteOptions } from 'webdriverio';
import { WebdriverLauncher } from '@web/test-runner-webdriver';
import ip from 'ip';
import { SauceLabsLauncherManager } from './SauceLabsLauncherManager';

const networkAddress = ip.address();

export class SauceLabsLauncher extends WebdriverLauncher {
  constructor(
    private manager: SauceLabsLauncherManager,
    public name: string,
    options: RemoteOptions,
  ) {
    super(options);
  }

  startSession(sessionId: string, url: string) {
    return super.startSession(sessionId, url.replace(/(localhost|127\.0\.0\.1)/, networkAddress));
  }

  async startDebugSession() {
    throw new Error('Starting a debug session is not supported in SauceLabs');
  }

  async initialize(config: TestRunnerCoreConfig) {
    await this.manager.registerLauncher(this);
    return super.initialize(config);
  }

  async stop() {
    const stopPromise = super.stop();
    await this.manager.deregisterLauncher(this);
    return stopPromise;
  }
}
