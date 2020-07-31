import { Page, ConsoleMessage } from 'puppeteer-core';
import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { V8Coverage, v8ToIstanbul } from '@web/test-runner-coverage-v8';
import { browserScript, deserialize } from '@web/browser-logs';
import { SessionResult } from '@web/test-runner-core';

export class ChromeLauncherPage {
  private coverageEnabled = false;
  private logs: Promise<any[]>[] = [];

  constructor(
    private config: TestRunnerCoreConfig,
    private testFiles: string[],
    public puppeteerPage: Page,
  ) {
    // inject serialization script
    puppeteerPage.evaluateOnNewDocument(browserScript);
    if (config.logBrowserLogs !== false) {
      puppeteerPage.on('console', this.onConsoleMessage);
    }
  }

  async runSession(url: string, coverage: boolean) {
    if (coverage && !this.coverageEnabled) {
      this.coverageEnabled = true;
      await this.puppeteerPage.coverage.startJSCoverage();
    }

    this.logs = [];
    await this.puppeteerPage.setViewport({ height: 600, width: 800 });
    await this.puppeteerPage.goto(url);
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
    // TODO: this is using a private puppeteer API to grab v8 test coverage, this can be removed
    // when https://github.com/puppeteer/puppeteer/issues/2136 is resolved
    const response = (await (this.puppeteerPage as any)._client.send(
      'Profiler.takePreciseCoverage',
    )) as {
      result: V8Coverage[];
    };
    // puppeteer already has the script sources available, remove this when above issue is resolved
    const scriptSources = (this.puppeteerPage as any)?.coverage?._jsCoverage?._scriptSources;

    const v8Coverage = response.result
      // remove puppeteer specific scripts
      .filter(r => r.url && r.url !== '__puppeteer_evaluation_script__')
      // attach source code
      .map(r => ({
        ...r,
        source: scriptSources.get(r.scriptId),
      }));

    await this.puppeteerPage.coverage?.stopJSCoverage();
    this.coverageEnabled = false;
    return v8ToIstanbul(config, testFiles, v8Coverage);
  }

  private onConsoleMessage = (message: ConsoleMessage) => {
    if (!this.collectMessageType(message.type())) {
      return;
    }

    const logsPromise = message.args().map(arg =>
      arg
        // serialize the log message in the browser to a string
        // __wtr_browser_logs__ is injected by a script, but in some cases we're setting it isn't available
        // for example for browser native warnings
        .evaluateHandle(e =>
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
