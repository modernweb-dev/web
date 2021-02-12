import WebDriver from 'webdriver';

function getPlatform(c: WebDriver.DesiredCapabilities): string | undefined {
  return c.platformName || c.platform;
}

export function getBrowserName(c: WebDriver.DesiredCapabilities): string | undefined {
  return c.browserName;
}

function getBrowserVersion(c: WebDriver.DesiredCapabilities): string | undefined {
  return c.browserVersion || c.version;
}

export function getBrowserLabel(c: WebDriver.DesiredCapabilities): string {
  return [getPlatform(c), getBrowserName(c), getBrowserVersion(c)].filter(_ => _).join(' ');
}
