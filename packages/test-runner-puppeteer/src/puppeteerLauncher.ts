import { chromeLauncher } from '@web/test-runner-chrome';
import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import * as puppeteer from 'puppeteer';
import * as puppeteerCore from 'puppeteer-core';
import { Browser, LaunchOptions, Page } from 'puppeteer-core';

export interface PuppeteerLauncherConfig {
  launchOptions?: LaunchOptions;
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
