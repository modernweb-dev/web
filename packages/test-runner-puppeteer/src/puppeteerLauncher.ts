import * as puppeteer from 'puppeteer';
import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { chromeLauncher } from '@web/test-runner-chrome';

export interface PuppeteerLauncherConfig {
  launchOptions?: puppeteer.LaunchOptions;
  createPage?: (args: {
    config: TestRunnerCoreConfig;
    browser: puppeteer.Browser;
  }) => Promise<puppeteer.Page>;
}

export function puppeteerLauncher({
  launchOptions,
  createPage,
}: PuppeteerLauncherConfig = {}): BrowserLauncher {
  return chromeLauncher({
    launchOptions,
    puppeteer: (puppeteer as any).default as typeof puppeteer,
    createPage,
  });
}
