import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { Capabilities } from '@wdio/types';
import { WebdriverLauncher } from '@web/test-runner-webdriver';
import internalIp from 'internal-ip';
import { SauceLabsLauncherManager } from './SauceLabsLauncherManager.js';

const localIp = internalIp.v4.sync() as string;
if (!localIp) {
  throw new Error('Can not determine the local IP.');
}

export class SauceLabsLauncher extends WebdriverLauncher {
  constructor(
    private manager: SauceLabsLauncherManager,
    public name: string,
    options: Capabilities.WebdriverIOConfig,
  ) {
    super(options);
  }

  startSession(sessionId: string, url: string) {
    return super.startSession(sessionId, url.replace(/(localhost|127\.0\.0\.1)/, localIp));
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
