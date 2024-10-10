import * as puppeteer from 'puppeteer';
import * as puppeteerCore from 'puppeteer-core';
import { Browser, BrowserContext, Page, PuppeteerNodeLaunchOptions } from 'puppeteer-core';
import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { chromeLauncher } from '@web/test-runner-chrome';

export interface PuppeteerLauncherConfig {
  launchOptions?: PuppeteerNodeLaunchOptions;
  createBrowserContext?: (args: {
    config: TestRunnerCoreConfig;
    browser: Browser;
  }) => BrowserContext | Promise<BrowserContext>;
  createPage?: (args: { config: TestRunnerCoreConfig; browser: Browser }) => Promise<Page>;
  concurrency?: number;
}

export function puppeteerLauncher({
  launchOptions,
  createBrowserContext,
  createPage,
  concurrency,
}: PuppeteerLauncherConfig = {}): BrowserLauncher {
  return chromeLauncher({
    launchOptions,
    puppeteer: (puppeteer as any).default as typeof puppeteerCore,
    createBrowserContext,
    createPage,
    concurrency,
  });
}
