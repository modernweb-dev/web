import { BrowserLauncher } from '@web/test-runner-core';
import SaucelabsAPI, {
  SauceLabsOptions,
  SauceConnectOptions,
  SauceConnectInstance,
} from 'saucelabs';
import internalIp from 'internal-ip';

/**
 * Wraps a Promise with a timeout, rejecing the promise with the timeout.
 */
export function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, 5 * 60 * 1000);

    promise
      .then(val => resolve(val))
      .catch(err => reject(err))
      .finally(() => clearTimeout(timeoutId));
  });
}
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

  async registerLauncher(launcher: BrowserLauncher) {
    this.launchers.add(launcher);

    if (this.connectionPromise != null) {
      await this.connectionPromise;
      return;
    }

    console.log('[Saucelabs] Setting up Sauce Connect proxy...');

    this.connectionPromise = withTimeout(
      this.api.startSauceConnect({
        ...this.connectOptions,
        tlsPassthroughDomains: `^(127\\.0\\.0\\.1|localhost|${internalIp.v4
          .sync()
          ?.replace(/\./g, '\\.')})$`,
      }),
      '[Saucelabs] Timed out setting up Sauce Connect proxy after 5 minutes.',
    );
    this.connection = await this.connectionPromise;
  }

  async deregisterLauncher(launcher: BrowserLauncher) {
    this.launchers.delete(launcher);

    if (this.launchers.size === 0) {
      return this.closeConnection();
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

    const connection = this.connection;
    this.connection = undefined;
    this.connectionPromise = undefined;

    if (connection != null) {
      await connection.close();
    }
  };
}
