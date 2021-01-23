import { Page } from 'playwright';
import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { V8Coverage, v8ToIstanbul } from '@web/test-runner-coverage-v8';
import { SessionResult } from '@web/test-runner-core';

export class PlaywrightLauncherPage {
  private config: TestRunnerCoreConfig;
  private testFiles: string[];
  public playwrightPage: Page;
  private nativeInstrumentationEnabledOnPage = false;

  constructor(config: TestRunnerCoreConfig, testFiles: string[], playwrightPage: Page) {
    this.config = config;
    this.testFiles = testFiles;
    this.playwrightPage = playwrightPage;
  }

  async runSession(url: string, coverage: boolean) {
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

    await this.playwrightPage.setViewportSize({ height: 600, width: 800 });
    await this.playwrightPage.goto(url);
  }

  async stopSession(): Promise<SessionResult> {
    const testCoverage = this.nativeInstrumentationEnabledOnPage
      ? await this.collectTestCoverage(this.config, this.testFiles)
      : undefined;

    // navigate to an empty page to kill any running code on the page, stopping timers and
    // breaking a potential endless reload loop
    await this.playwrightPage.goto('about:blank');

    return { testCoverage };
  }

  private async collectTestCoverage(config: TestRunnerCoreConfig, testFiles: string[]) {
    const userAgentPromise = this.playwrightPage.evaluate(() => window.navigator.userAgent);
    try {
      const coverageFromBrowser = await this.playwrightPage.evaluate(
        () => (window as any).__coverage__,
      );

      if (coverageFromBrowser) {
        // coverage was generated by JS, return that
        return coverageFromBrowser;
      }
    } catch (error) {
      // evaluate throws when the a test navigates in the browser
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
    const userAgent = await userAgentPromise;
    return v8ToIstanbul(config, testFiles, coverage, userAgent);
  }
}
