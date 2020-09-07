import { Page, ConsoleMessage } from 'playwright';
import {
  getBrowserPageNavigationError,
  TestResultError,
  TestRunnerCoreConfig,
  CoverageMapData,
} from '@web/test-runner-core';
import { V8Coverage, v8ToIstanbul } from '@web/test-runner-coverage-v8';
import { browserScript, deserialize } from '@web/browser-logs';
import { SessionResult } from '@web/test-runner-core';

// these warnings are generated by mocha
const filteredBrowserWarnings = [
  "'window.webkitStorageInfo' is deprecated.",
  'onmozfullscreenchange is deprecated.',
  'onmozfullscreenerror is deprecated.',
];

function filterBrowserLogs(browserLogs: any[][]) {
  return browserLogs.filter(log => {
    return !(
      log.length === 1 &&
      typeof log[0] === 'string' &&
      filteredBrowserWarnings.some(warn => log[0].includes(warn))
    );
  });
}

export class PlaywrightLauncherPage {
  private nativeInstrumentationEnabledOnPage = false;
  private logs: Promise<any[]>[] = [];
  private testURL?: URL;
  private navigations: URL[] = [];

  constructor(
    private config: TestRunnerCoreConfig,
    private testFiles: string[],
    public playwrightPage: Page,
  ) {
    // inject serialization script
    playwrightPage.addInitScript(browserScript);

    // track browser navigations
    playwrightPage.on('request', e => {
      if (e.isNavigationRequest()) {
        this.navigations.push(new URL(e.url()));
      }
    });

    if (config.logBrowserLogs !== false) {
      playwrightPage.on('console', this.onConsoleMessage);
    }
  }

  async runSession(url: string, coverage: boolean) {
    this.testURL = new URL(url);
    this.navigations = [];

    if (
      coverage &&
      this.playwrightPage.coverage &&
      this.config.coverageConfig?.nativeInstrumentation !== false
    ) {
      if (this.nativeInstrumentationEnabledOnPage) {
        await this.playwrightPage.coverage.stopJSCoverage();
      }
      this.nativeInstrumentationEnabledOnPage = true;
      await this.playwrightPage.coverage.startJSCoverage();
    }

    this.logs = [];
    await this.playwrightPage.setViewportSize({ height: 600, width: 800 });
    await this.playwrightPage.goto(url);
  }

  async stopSession(): Promise<SessionResult> {
    const errors: TestResultError[] = [];
    let testCoverage: CoverageMapData | undefined;
    let browserLogs: any[][] = [];

    // check if the page was navigated, resulting in broken tests
    const navigationError = getBrowserPageNavigationError(this.testURL!, this.navigations);
    if (navigationError) {
      errors.push(navigationError);
    } else {
      const testCoveragePromise = this.nativeInstrumentationEnabledOnPage
        ? this.collectTestCoverage(this.config, this.testFiles)
        : undefined;

      [testCoverage, browserLogs] = await Promise.all([
        testCoveragePromise,
        Promise.all(this.logs),
      ]);
      browserLogs = filterBrowserLogs(browserLogs);
    }

    // navigate to an empty page to kill any running code on the page, stopping timers and
    // breaking a potential endless reload loop
    await this.playwrightPage.goto('data:,');

    return { testCoverage, browserLogs, errors };
  }

  private async collectTestCoverage(config: TestRunnerCoreConfig, testFiles: string[]) {
    const coverageFromBrowser = await this.playwrightPage.evaluate(
      () => (window as any).__coverage__,
    );

    if (coverageFromBrowser) {
      // coverage was generated by JS, return that
      return coverageFromBrowser;
    }

    if (config.coverageConfig?.nativeInstrumentation === false) {
      throw new Error(
        'Coverage is enabled with nativeInstrumentation disabled. ' +
          'Expected coverage provided in the browser as a global __coverage__ variable.' +
          'Use a plugin like babel-plugin-istanbul to generate the coverage, or enable native instrumentation.',
      );
    }

    // get native coverage from playwright
    const coverage = ((await this.playwrightPage.coverage?.stopJSCoverage()) ?? []) as V8Coverage[];
    this.nativeInstrumentationEnabledOnPage = false;
    return v8ToIstanbul(config, testFiles, coverage);
  }

  private onConsoleMessage = (message: ConsoleMessage) => {
    if (!this.collectMessageType(message.type())) {
      return;
    }

    const args = message.args();

    if (args.length > 0) {
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
    } else {
      this.logs.push(Promise.resolve([message.text()]));
    }
  };

  private collectMessageType(type: string) {
    return (
      this.config.logBrowserLogs === true ||
      (Array.isArray(this.config.logBrowserLogs) &&
        this.config.logBrowserLogs.includes(type as any))
    );
  }
}
