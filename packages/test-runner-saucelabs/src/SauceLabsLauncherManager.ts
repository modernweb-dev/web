import { BrowserLauncher } from '@web/test-runner-core';
import SaucelabsAPI, {
  SauceLabsOptions,
  SauceConnectOptions,
  SauceConnectInstance,
} from 'saucelabs';
import ip from 'ip';

export class SauceLabsLauncherManager {
  private api: SaucelabsAPI;
  private launchers = new Set<BrowserLauncher>();
  private connectionPromise?: Promise<SauceConnectInstance>;
  private connection?: SauceConnectInstance;
  private options: SauceLabsOptions;
  private connectOptions?: SauceConnectOptions;

  constructor(options: SauceLabsOptions, connectOptions?: SauceConnectOptions) {
    this.options = options;
    this.connectOptions = connectOptions;
    this.api = new SaucelabsAPI(this.options);

    process.on('SIGINT', this.closeConnection);
    process.on('SIGTERM', this.closeConnection);
    process.on('beforeExit', this.closeConnection);
    process.on('exit', this.closeConnection);
  }

  get webdriverEndpoint() {
    return `${this.api.webdriverEndpoint}wd/hub`;
  }

  async registerLauncher(launcher: BrowserLauncher) {
    this.launchers.add(launcher);

    if (this.connectionPromise != null) {
      await this.connectionPromise;
      return;
    }

    console.log('[Saucelabs] Setting up Sauce Connect proxy...');
    this.connectionPromise = this.api.startSauceConnect({
      ...this.connectOptions,
      noSslBumpDomains: `127.0.0.1,localhost,${ip.address()}`,
    });
    this.connection = await this.connectionPromise;
  }

  async deregisterLauncher(launcher: BrowserLauncher) {
    this.launchers.delete(launcher);

    if (this.launchers.size === 0) {
      this.closeConnection();
    }
  }

  private closeConnection = async () => {
    if (this.connection == null && this.connectionPromise == null) {
      // already closed
      return;
    }

    if (this.connection == null) {
      // wait for connection to finish opening
      await this.connectionPromise;
    }

    if (this.connection != null) {
      this.connection.close();
    }
    this.connection = undefined;
    this.connectionPromise = undefined;
  };
}
