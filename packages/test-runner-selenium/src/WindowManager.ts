import { TestRunnerCoreConfig, CoverageMapData, SessionResult } from '@web/test-runner-core';
import { WebDriver, Key, By } from 'selenium-webdriver';

interface QueuedStartSession {
  id: string;
  url: string;
  resolve: () => void;
}

interface QueuedStopSession {
  id: string;
  resolve: (result: SessionResult) => void;
}

/**
 * Selenium can only do work on a single focused window at a time. This manager queues
 * tasks for starting or stopping a test session, allowing only one job of starting or
 * stopping a session at a time.
 */
export class WindowManager {
  private driver: WebDriver;
  private config: TestRunnerCoreConfig;
  private startQueue: QueuedStartSession[] = [];
  private stopQueue: QueuedStopSession[] = [];
  private windowsPerSession = new Map<string, string>();
  private inactiveWindows: string[] = [];
  private locked = false;

  constructor(driver: WebDriver, config: TestRunnerCoreConfig) {
    this.driver = driver;
    this.config = config;
  }

  isActive(id: string) {
    return this.windowsPerSession.has(id);
  }

  queueStartSession(id: string, url: string): Promise<void> {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        this.startSession({ id, url, resolve });
      } else {
        this.startQueue.push({ id, url, resolve });
      }
    });
  }

  queueStopSession(id: string): Promise<SessionResult> {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        this.stopSession({ id, resolve });
      } else {
        this.stopQueue.push({ id, resolve });
      }
    });
  }

  private runNextQueued() {
    if (this.stopQueue.length > 0) {
      const next = this.stopQueue.shift()!;
      this.stopSession(next);
      return;
    }

    if (this.startQueue.length > 0) {
      const next = this.startQueue.shift()!;
      this.startSession(next);
      return;
    }

    this.locked = false;
  }

  /**
   * Focuses the browser to a window available for running a test.
   *
   * If there are inactive browser windows, we use those. Otherwise we
   * create a new one.
   */
  private async switchToAvailableWindow() {
    let windowHandle: string;
    if (this.inactiveWindows.length > 0) {
      windowHandle = this.inactiveWindows.pop()!;
    } else {
      const handlesCountBefore = (await this.driver.getAllWindowHandles()).length;
      await this.driver.executeScript('window.open("about:blank")');
      const handles = await this.driver.getAllWindowHandles();
      if (handlesCountBefore + 1 !== handles.length) {
        throw new Error('Something went wrong while opening a new browser window');
      }
      windowHandle = handles[handles.length - 1];
    }
    await this.driver.switchTo().window(windowHandle);
    return windowHandle;
  }

  private async startSession({ id, url, resolve }: QueuedStartSession) {
    const windowHandle = await this.switchToAvailableWindow();
    this.windowsPerSession.set(id, windowHandle);
    await this.driver.get(url);
    this.runNextQueued();
    resolve();
  }

  private async stopSession({ id, resolve }: QueuedStopSession) {
    const windowHandle = this.windowsPerSession.get(id);
    this.windowsPerSession.delete(id);
    if (!windowHandle) {
      throw new Error(
        `Something went wrong while running tests, there is no window handle for session ${id}`,
      );
    }
    await this.driver.switchTo().window(windowHandle);

    let testCoverage: CoverageMapData | undefined = undefined;

    if (this.config.coverage) {
      testCoverage = await this.driver?.executeScript<CoverageMapData>(function () {
        return (window as any).__coverage__;
      });
    }

    this.inactiveWindows.push(windowHandle);
    this.runNextQueued();
    resolve({ browserLogs: [], testCoverage });
  }
}
