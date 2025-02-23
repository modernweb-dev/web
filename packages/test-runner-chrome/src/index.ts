import * as puppeteerCore from 'puppeteer-core';
import { ChromeLauncher, CreateBrowserContextFn, CreatePageFn } from './ChromeLauncher.js';
import { LaunchOptions } from 'puppeteer-core';

export interface ChromeLauncherArgs {
  puppeteer?: typeof puppeteerCore;
  launchOptions?: LaunchOptions;
  createBrowserContext?: CreateBrowserContextFn;
  createPage?: CreatePageFn;
  concurrency?: number;
}

export { ChromeLauncher, puppeteerCore };

export function chromeLauncher(args: ChromeLauncherArgs = {}) {
  const {
    launchOptions = {},
    createBrowserContext = ({ browser }) => browser.defaultBrowserContext(),
    createPage = ({ context }) => context.newPage(),
    puppeteer,
    concurrency,
  } = args;

  return new ChromeLauncher(
    launchOptions,
    createBrowserContext,
    createPage,
    puppeteer,
    concurrency,
  );
}
