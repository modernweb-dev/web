import { Page, ConsoleMessage } from 'playwright';
import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { V8Coverage, v8ToIstanbul } from '@web/test-runner-coverage-v8';
import { browserScript, deserialize } from '@web/browser-logs';
import { SessionResult } from '@web/test-runner-core';

export class PlaywrightLauncherPage {
  private coverageEnabled = false;
  private logs: Promise<any[]>[] = [];

  constructor(
    private config: TestRunnerCoreConfig,
    private testFiles: string[],
    public playwrightPage: Page,
  ) {
    // inject serialization script
    playwrightPage.addInitScript(browserScript);
    if (config.logBrowserLogs !== false) {
      playwrightPage.on('console', this.onConsoleMessage);
    }
  }

  async runSession(url: string, coverage: boolean) {
    if (coverage && !this.coverageEnabled && this.playwrightPage.coverage) {
      this.coverageEnabled = true;
      await this.playwrightPage.coverage.startJSCoverage();
    }

    this.logs = [];
    await this.playwrightPage.setViewportSize({ height: 600, width: 800 });
    await this.playwrightPage.goto(url);
  }

  async stopSession(): Promise<SessionResult> {
    const testCoveragePromise = this.coverageEnabled
      ? this.collectTestCoverage(this.config, this.testFiles)
      : undefined;

    const [testCoverage, browserLogs] = await Promise.all([
      testCoveragePromise,
      Promise.all(this.logs),
    ]);

    return { testCoverage, browserLogs };
  }

  private async collectTestCoverage(config: TestRunnerCoreConfig, testFiles: string[]) {
    const coverage = ((await this.playwrightPage.coverage?.stopJSCoverage()) ?? []) as V8Coverage[];
    this.coverageEnabled = false;
    return v8ToIstanbul(config, testFiles, coverage);
  }

  private onConsoleMessage = (message: ConsoleMessage) => {
    if (!this.collectMessageType(message.type())) {
      return;
    }

    const logsPromise = message.args().map(arg =>
      arg
        // serialize the log message in the browser to a string
        .evaluateHandle(e =>
          // TODO: https://github.com/modernweb-dev/web/issues/262
          (window as any).__wtr_browser_logs__
            ? (window as any).__wtr_browser_logs__.serialize(e)
            : JSON.stringify(e),
        )
        // pass along the message from the browser to NodeJS as a string
        .then(handle => handle.jsonValue())
        // deserialize the string to an array of logs
        .then(str => deserialize(str as string))
        .catch(err => `Error while collecting browser logs: ${err.message}`),
    );

    this.logs.push(Promise.all(logsPromise));
  };

  private collectMessageType(type: string) {
    return (
      this.config.logBrowserLogs === true ||
      (Array.isArray(this.config.logBrowserLogs) &&
        this.config.logBrowserLogs.includes(type as any))
    );
  }
}
