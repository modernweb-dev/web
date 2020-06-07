/* eslint-disable @typescript-eslint/no-var-requires */

function loadLauncher(name: string) {
  const pkg = `@web/test-runner-${name}`;
  try {
    return require(pkg);
  } catch (error) {
    throw new Error(`Add ${pkg} as a dependency to use the --${name} flag.`);
  }
}

export function puppeteerLauncher() {
  return loadLauncher('puppeteer').puppeteerLauncher();
}

export function playwrightLauncher(browserTypes: string[]) {
  return loadLauncher('playwright').playwrightLauncher({ browserTypes });
}
