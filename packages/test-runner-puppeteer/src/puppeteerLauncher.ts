import * as puppeteer from 'puppeteer';
import { BrowserLauncher } from '@web/test-runner-core';
import { chromeLauncher } from '@web/test-runner-chrome';

export interface PuppeteerLauncherConfig {
  launchOptions?: puppeteer.LaunchOptions;
}

export function puppeteerLauncher({
  launchOptions,
}: PuppeteerLauncherConfig = {}): BrowserLauncher {
  return chromeLauncher({
    launchOptions,
    puppeteer: (puppeteer as any).default as typeof puppeteer,
  });
}
