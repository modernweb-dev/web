import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { WebDriver } from 'selenium-webdriver';
import { BrowserResult, IFrameManager } from '@web/test-runner-iframe-manager';

/**
 * Manages tests to be executed in iframes on a page.
 */
export class SeleniumIFrameManager extends IFrameManager {
  private driver: WebDriver;

  constructor(config: TestRunnerCoreConfig, driver: WebDriver, isIE: boolean) {
    super(config, isIE);
    this.driver = driver;
  }

  async navigateTo(pageUrl: string): Promise<void> {
    await this.driver.navigate().to(pageUrl);
  }

  async getIframeUrl(frameId: string): Promise<string | undefined> {
    const returnValue = (await this.driver.executeScript(`
      try {
        var iframe = document.getElementById("${frameId}");
        return iframe.contentWindow.location.href;
      } catch (_) {
        return undefined;
      }
    `)) as string | undefined;

    return returnValue;
  }

  async initIframe(frameId: string, url: string): Promise<void> {
    await this.driver.executeScript(`
      var iframe = document.createElement("iframe");
      iframe.id = "${frameId}";
      iframe.src = "${url}";
      document.body.appendChild(iframe);
    `);
  }

  async attachToIframe(frameId: string, url: string): Promise<void> {
    await this.driver.executeScript(`
      var iframe = document.getElementById("${frameId}");
      iframe.src = "${url}";
    `);
  }

  async getTestCoverage(frameId: string): Promise<BrowserResult> {
    // Retrieve test results from iframe.
    const returnValue = (await this.driver.executeScript(`
      var iframe = document.getElementById("${frameId}");
      var testCoverage;
      try {
        testCoverage = iframe.contentWindow.__coverage__;
      } catch (error) {
        // iframe can throw a cross-origin error if the test navigated
      }

      // set src after retrieving values to avoid the iframe from navigating away
      iframe.src = "data:,";
      return { testCoverage: testCoverage };
    `)) as BrowserResult;

    return returnValue;
  }
}
