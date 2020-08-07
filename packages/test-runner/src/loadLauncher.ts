/* eslint-disable @typescript-eslint/no-var-requires */
const puppeteerBrowsers = ['chrome', 'firefox'];
const playwrightBrowsers = ['chromium', 'firefox', 'webkit'];

function loadLauncher(name: string) {
  const pkg = `@web/test-runner-${name}`;
  try {
    return require(pkg);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(`Add ${pkg} as a dependency to use the --${name} flag.`);
    } else {
      throw error;
    }
  }
}

export function puppeteerLauncher(browsers: string[] = ['chrome']) {
  for (const browser of browsers) {
    if (!puppeteerBrowsers.includes(browser)) {
      throw new Error(
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
      throw new Error(
        `Unknown playwright browser: ${browser}. ` +
          `Supported browsers: ${playwrightBrowsers.join(', ')}`,
      );
    }
  }

  const launcher = loadLauncher('playwright').playwrightLauncher;
  return browsers.map(product => launcher({ product }));
}
