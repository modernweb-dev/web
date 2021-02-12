import { TestRunnerStartError } from '../TestRunnerStartError';

/* eslint-disable @typescript-eslint/no-var-requires */
const puppeteerBrowsers = ['chrome', 'firefox'];
const playwrightBrowsers = ['chromium', 'firefox', 'webkit'];

function loadLauncher(name: string) {
  const pkg = `@web/test-runner-${name}`;
  try {
    const path = require.resolve(pkg, { paths: [__dirname, process.cwd()] });
    return require(path);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new TestRunnerStartError(
        `You need to add ${pkg} as a dependency of your project to use the --${name} flag.`,
      );
    } else {
      throw error;
    }
  }
}

export function puppeteerLauncher(browsers: string[] = ['chrome']) {
  for (const browser of browsers) {
    if (!puppeteerBrowsers.includes(browser)) {
      throw new TestRunnerStartError(
        `Unknown puppeteer browser: ${browser}. ` +
          `Supported browsers: ${puppeteerBrowsers.join(', ')}`,
      );
    }
  }

  const launcher = loadLauncher('puppeteer').puppeteerLauncher;
  return browsers.map(product => launcher({ launchOptions: { product } }));
}

export function playwrightLauncher(browsers: string[] = ['chromium']) {
  for (const browser of browsers) {
    if (!playwrightBrowsers.includes(browser)) {
      throw new TestRunnerStartError(
        `Unknown playwright browser: ${browser}. ` +
          `Supported browsers: ${playwrightBrowsers.join(', ')}`,
      );
    }
  }

  const launcher = loadLauncher('playwright').playwrightLauncher;
  return browsers.map(product => launcher({ product }));
}
