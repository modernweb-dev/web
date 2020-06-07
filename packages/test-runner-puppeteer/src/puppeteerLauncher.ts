import * as puppeteer from 'puppeteer';
import { BrowserLauncher } from '@web/test-runner-core';
import { chromeLauncher } from '@web/test-runner-chrome';

export interface PuppeteerLauncherConfig {
  args: string[];
}

export function puppeteerLauncher({
  args,
}: Partial<PuppeteerLauncherConfig> = {}): BrowserLauncher {
  return chromeLauncher({ puppeteer: (puppeteer as any).default as typeof puppeteer, args });
}
