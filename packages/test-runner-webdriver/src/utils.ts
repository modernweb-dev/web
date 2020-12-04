import { DesiredCapabilities } from 'webdriver';

function getPlatform(c: DesiredCapabilities): string | undefined {
  return c.platformName || c.platform;
}

export function getBrowserName(c: DesiredCapabilities): string | undefined {
  return c.browserName;
}

function getBrowserVersion(c: DesiredCapabilities): string | undefined {
  return c.browserVersion || c.version;
}

export function getBrowserLabel(c: DesiredCapabilities): string {
  return [getPlatform(c), getBrowserName(c), getBrowserVersion(c)].filter(_ => _).join(' ');
}
