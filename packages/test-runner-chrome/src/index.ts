import * as puppeteerCore from 'puppeteer-core';
import { ChromeLauncher, CreateBrowserContextFn, CreatePageFn } from './ChromeLauncher';
import { PuppeteerNodeLaunchOptions, devices } from 'puppeteer-core';

export interface ChromeLauncherArgs {
  puppeteer?: typeof puppeteerCore;
  launchOptions?: PuppeteerNodeLaunchOptions;
  createBrowserContext?: CreateBrowserContextFn;
  createPage?: CreatePageFn;
  concurrency?: number;
}

export { ChromeLauncher, devices, puppeteerCore };

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
