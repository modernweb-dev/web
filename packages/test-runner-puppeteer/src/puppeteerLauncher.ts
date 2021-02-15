import * as puppeteer from 'puppeteer';
import * as puppeteerCore from 'puppeteer-core';
import { Browser, Page, PuppeteerNodeLaunchOptions } from 'puppeteer-core';
import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { chromeLauncher } from '@web/test-runner-chrome';

export interface PuppeteerLauncherConfig {
  launchOptions?: PuppeteerNodeLaunchOptions;
  createPage?: (args: { config: TestRunnerCoreConfig; browser: Browser }) => Promise<Page>;
  concurrency?: number;
}

export function puppeteerLauncher({
  launchOptions,
  createPage,
  concurrency,
}: PuppeteerLauncherConfig = {}): BrowserLauncher {
  return chromeLauncher({
    launchOptions,
    puppeteer: (puppeteer as any).default as typeof puppeteerCore,
    createPage,
    concurrency,
  });
}
