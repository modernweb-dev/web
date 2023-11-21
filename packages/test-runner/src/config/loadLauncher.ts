import { TestRunnerStartError } from '../TestRunnerStartError.js';

const puppeteerBrowsers = ['chrome', 'firefox'];
const playwrightBrowsers = ['chromium', 'firefox', 'webkit'];

async function loadLauncher(name: string) {
  const pkg = `@web/test-runner-${name}`;
  try {
    return await import(pkg);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
      throw new TestRunnerStartError(
        `You need to add ${pkg} as a dependency of your project to use the --${name} flag.`,
      );
    } else {
      throw error;
    }
  }
}

export async function puppeteerLauncher(browsers: string[] = ['chrome']) {
  for (const browser of browsers) {
    if (!puppeteerBrowsers.includes(browser)) {
      throw new TestRunnerStartError(
        `Unknown puppeteer browser: ${browser}. ` +
          `Supported browsers: ${puppeteerBrowsers.join(', ')}`,
      );
    }
  }

  const launcher = (await loadLauncher('puppeteer')).puppeteerLauncher;
  return browsers.map(product => launcher({ launchOptions: { product } }));
}

export async function playwrightLauncher(browsers: string[] = ['chromium']) {
  for (const browser of browsers) {
    if (!playwrightBrowsers.includes(browser)) {
      throw new TestRunnerStartError(
        `Unknown playwright browser: ${browser}. ` +
          `Supported browsers: ${playwrightBrowsers.join(', ')}`,
      );
    }
  }

  const launcher = (await loadLauncher('playwright')).playwrightLauncher;
  return browsers.map(product => launcher({ product }));
}
