import * as puppeteerCore from 'puppeteer-core';
import { ChromeLauncher } from './ChromeLauncher';
import { LaunchOptions, Browser, Page } from 'puppeteer-core';
import { TestRunnerCoreConfig } from '@web/test-runner-core';

export interface ChromeLauncherArgs {
  puppeteer?: typeof puppeteerCore;
  launchOptions?: LaunchOptions;
  createPage?: (args: { config: TestRunnerCoreConfig; browser: Browser }) => Promise<Page>;
  concurrency?: number;
}

export { ChromeLauncher };

export function chromeLauncher(args: ChromeLauncherArgs = {}) {
  return new ChromeLauncher(
    args.launchOptions ?? {},
    args.puppeteer,
    args.createPage,
    args.concurrency,
  );
}
