import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { Browser, remote } from 'webdriverio';
import { Capabilities } from '@wdio/types';
import { IFrameManager } from './IFrameManager.js';
import { SessionManager } from './SessionManager.js';
import { getBrowserLabel } from './utils.js';

type MouseButton = 'left' | 'middle' | 'right';

function getMouseButtonCode(button: MouseButton) {
  switch (button) {
    case 'left':
      return 0;
    case 'middle':
      return 1;
    case 'right':
      return 2;
  }
}

export class WebdriverLauncher implements BrowserLauncher {
  public name = 'Initializing...';
  public type = 'webdriver';
  private config?: TestRunnerCoreConfig;
  private driver?: Browser;
  private debugDriver: undefined | Browser = undefined;
  private driverManager?: IFrameManager | SessionManager;
  private __managerPromise?: Promise<IFrameManager | SessionManager>;
  private isIE = false;
  private pendingHeartbeat?: ReturnType<typeof setInterval>;

  constructor(private options: Capabilities.WebdriverIOConfig) {}

  async initialize(config: TestRunnerCoreConfig) {
    this.config = config;

    const cap = this.options.capabilities as WebdriverIO.Capabilities;
    this.name = getBrowserLabel(cap);
    const browserName = cap.browserName?.toLowerCase().replace(/_/g, ' ') || '';
    this.isIE =
      (browserName.includes('internet') && browserName.includes('explorer')) ||
      browserName === 'ie' ||
      browserName === 'ie11';
  }

  async stop() {
    try {
      if (this.pendingHeartbeat != null) {
        clearInterval(this.pendingHeartbeat);
      }
      await this.driver?.deleteSession();
      await this.debugDriver?.deleteSession();

      this.driver = undefined;
      this.debugDriver = undefined;
      this.driverManager = undefined;
    } catch {
      //
    }
  }

  async startSession(id: string, url: string) {
    await this.ensureManagerInitialized();
    return this.driverManager!.queueStartSession(id, url);
  }

  isActive(id: string) {
    return !!this.driverManager?.isActive(id);
  }

  getBrowserUrl(sessionId: string) {
    if (!this.driverManager) {
      throw new Error('Not initialized');
    }
    return this.driverManager.getBrowserUrl(sessionId);
  }

  async stopSession(id: string) {
    return this.driverManager!.queueStopSession(id);
  }

  async startDebugSession(_: string, url: string) {
    if (this.debugDriver) {
      await this.debugDriver.deleteSession();
    }
    this.debugDriver = (await remote(this.options)) as Browser;
    await this.debugDriver.navigateTo(url);
  }

  private async ensureManagerInitialized(): Promise<void> {
    if (this.driverManager) {
      return;
    }

    if (this.__managerPromise) {
      await this.__managerPromise;
      return;
    }

    this.__managerPromise = this.createDriverManager();
    await this.__managerPromise;
    this.__managerPromise = undefined;
  }

  private async createDriverManager() {
    if (!this.config) throw new Error('Not initialized');
    const options: Capabilities.WebdriverIOConfig = { logLevel: 'error', ...this.options };

    try {
      this.driver = (await remote(options)) as Browser;
      this.driverManager =
        this.config.concurrency === 1
          ? new SessionManager(this.config, this.driver, this.isIE)
          : new IFrameManager(this.config, this.driver, this.isIE);
      this.setupHeartbeat();
      return this.driverManager;
    } catch (e) {
      this.stop();
      throw e;
    }
  }

  /**
   * Sets up a heartbeat to avoid the session from expiring due to
   * inactivity because of a long running test.
   */
  private setupHeartbeat() {
    this.pendingHeartbeat = setInterval(async () => {
      if (!this.driver) return;
      try {
        await this.driver.getTitle();
      } catch (e) {
        // Do nothing, just clear the timeout
        if (this.pendingHeartbeat != null) {
          clearInterval(this.pendingHeartbeat);
        }
      }
    }, 60000);
  }

  sendMouseMove(sessionId: string, x: number, y: number) {
    if (!this.driverManager) {
      throw new Error('Not initialized');
    }

    return this.driverManager.performActions(sessionId, [
      {
        type: 'pointer',
        id: 'finger1',
        actions: [{ type: 'pointerMove', duration: 0, x, y }],
      },
    ]);
  }

  sendMouseClick(sessionId: string, x: number, y: number, button: MouseButton = 'left') {
    if (!this.driverManager) {
      throw new Error('Not initialized');
    }

    const buttonCode = getMouseButtonCode(button);

    return this.driverManager.performActions(sessionId, [
      {
        type: 'pointer',
        id: 'finger1',
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: buttonCode },
          { type: 'pointerUp', button: buttonCode },
        ],
      },
    ]);
  }

  sendMouseDown(sessionId: string, button: MouseButton = 'left') {
    if (!this.driverManager) {
      throw new Error('Not initialized');
    }

    const buttonCode = getMouseButtonCode(button);

    return this.driverManager.performActions(sessionId, [
      {
        type: 'pointer',
        id: 'finger1',
        actions: [{ type: 'pointerDown', button: buttonCode }],
      },
    ]);
  }

  sendMouseUp(sessionId: string, button: MouseButton = 'left') {
    if (!this.driverManager) {
      throw new Error('Not initialized');
    }

    const buttonCode = getMouseButtonCode(button);

    return this.driverManager.performActions(sessionId, [
      {
        type: 'pointer',
        id: 'finger1',
        actions: [{ type: 'pointerUp', button: buttonCode }],
      },
    ]);
  }

  resetMouse(sessionId: string) {
    if (!this.driverManager) {
      throw new Error('Not initialized');
    }

    return this.driverManager.performActions(sessionId, [
      {
        type: 'pointer',
        id: 'finger1',
        actions: [
          { type: 'pointerUp', button: getMouseButtonCode('left') },
          { type: 'pointerUp', button: getMouseButtonCode('middle') },
          { type: 'pointerUp', button: getMouseButtonCode('right') },
          { type: 'pointerMove', duration: 0, x: 0, y: 0 },
        ],
      },
    ]);
  }

  sendKeys(sessionId: string, keys: string[]) {
    if (!this.driverManager) {
      throw new Error('Not initialized');
    }
    return this.driverManager.sendKeys(sessionId, keys);
  }

  takeScreenshot(sessionId: string, locator: string) {
    if (!this.driverManager) {
      throw new Error('Not initialized');
    }
    return this.driverManager.takeScreenshot(sessionId, locator);
  }
}

export function webdriverLauncher(options: Capabilities.WebdriverIOConfig) {
  if (!options?.capabilities) {
    throw new Error(`Webdriver launcher requires a capabilities property.`);
  }

  return new WebdriverLauncher(options);
}
