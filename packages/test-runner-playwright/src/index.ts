import * as playwright from 'playwright';
import { LaunchOptions, devices } from 'playwright';
import {
  CreateBrowserContextFn,
  CreatePageFn,
  PlaywrightLauncher,
  ProductType,
} from './PlaywrightLauncher.js';

const validProductTypes: ProductType[] = ['chromium', 'firefox', 'webkit'];

export { PlaywrightLauncher, ProductType, devices, playwright };

export interface PlaywrightLauncherArgs {
  product?: ProductType;
  launchOptions?: LaunchOptions;
  createBrowserContext?: CreateBrowserContextFn;
  createPage?: CreatePageFn;
  __experimentalWindowFocus__?: boolean;
  concurrency?: number;
}

export function playwrightLauncher(args: PlaywrightLauncherArgs = {}) {
  const {
    product = 'chromium',
    launchOptions = {},
    createBrowserContext = ({ browser }) => browser.newContext(),
    createPage = ({ context }) => context.newPage(),
    __experimentalWindowFocus__ = false,
    concurrency,
  } = args;

  if (!validProductTypes.includes(product)) {
    throw new Error(
      `Invalid product: ${product}. Valid product types: ${validProductTypes.join(', ')}`,
    );
  }

  return new PlaywrightLauncher(
    product,
    launchOptions,
    createBrowserContext,
    createPage,
    __experimentalWindowFocus__,
    concurrency,
  );
}
