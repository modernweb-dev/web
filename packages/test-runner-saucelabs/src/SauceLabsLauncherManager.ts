import { BrowserLauncher } from '@web/test-runner-core';
import SaucelabsAPI, {
  SauceLabsOptions,
  SauceConnectOptions,
  SauceConnectInstance,
} from 'saucelabs';

export class SauceLabsLauncherManager {
  private launchers = new Set<BrowserLauncher>();
  private connectionPromise: Promise<SauceConnectInstance> | undefined = undefined;

  constructor(private options: SauceLabsOptions, private connectOptions?: SauceConnectOptions) {}

  async registerLauncher(launcher: BrowserLauncher) {
    this.launchers.add(launcher);

    if (this.connectionPromise == null) {
      const api = new SaucelabsAPI(this.options);
      this.connectionPromise = api.startSauceConnect(this.connectOptions ?? {});
      await this.connectionPromise;
    }
  }

  async deregisterLauncher(launcher: BrowserLauncher) {
    this.launchers.delete(launcher);

    if (this.connectionPromise != null && this.launchers.size === 0) {
      const connection = await this.connectionPromise;
      await connection.close();
    }
  }
}
