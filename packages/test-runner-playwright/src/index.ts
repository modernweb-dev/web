import { LaunchOptions, Browser, Page } from 'playwright';
import { PlaywrightLauncher, ProductType } from './PlaywrightLauncherClass';
import { TestRunnerCoreConfig } from '@web/test-runner-core';

const validProductTypes: ProductType[] = ['chromium', 'firefox', 'webkit'];

export { ProductType };

export interface PlaywrightLauncherArgs {
  product?: ProductType;
  launchOptions?: LaunchOptions;
  createPage?: (args: { config: TestRunnerCoreConfig; browser: Browser }) => Promise<Page>;
}

export function playwrightLauncher(args: PlaywrightLauncherArgs = {}) {
  const product = args.product ?? 'chromium';
  if (!validProductTypes.includes(product)) {
    throw new Error(
      `Invalid product: ${product}. Valid product types: ${validProductTypes.join(', ')}`,
    );
  }

  return new PlaywrightLauncher(product, args.launchOptions ?? {}, args.createPage);
}
