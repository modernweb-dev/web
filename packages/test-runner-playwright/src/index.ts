import { LaunchOptions, Browser, Page } from 'playwright';
import { PlaywrightLauncher, ProductType } from './PlaywrightLauncher';
import { TestRunnerCoreConfig } from '@web/test-runner-core';

const validProductTypes: ProductType[] = ['chromium', 'firefox', 'webkit'];

export { ProductType };

export interface PlaywrightLauncherArgs {
  product?: ProductType;
  launchOptions?: LaunchOptions;
  createPage?: (args: { config: TestRunnerCoreConfig; browser: Browser }) => Promise<Page>;
  __experimentalWindowFocus__?: boolean;
  concurrency?: number;
}

export { PlaywrightLauncher };

export function playwrightLauncher(args: PlaywrightLauncherArgs = {}) {
  const product = args.product ?? 'chromium';
  if (!validProductTypes.includes(product)) {
    throw new Error(
      `Invalid product: ${product}. Valid product types: ${validProductTypes.join(', ')}`,
    );
  }

  return new PlaywrightLauncher(
    product,
    args.launchOptions ?? {},
    args.createPage,
    !!args.__experimentalWindowFocus__,
    args.concurrency,
  );
}
