import { Capabilities } from '@wdio/types';

function getPlatform(c: Capabilities.DesiredCapabilities): string | undefined {
  return c.platformName || c.platform;
}

export function getBrowserName(c: Capabilities.DesiredCapabilities): string | undefined {
  return c.browserName;
}

function getBrowserVersion(c: Capabilities.DesiredCapabilities): string | undefined {
  return c.browserVersion || c.version;
}

export function getBrowserLabel(c: Capabilities.DesiredCapabilities): string {
  return [getPlatform(c), getBrowserName(c), getBrowserVersion(c)].filter(_ => _).join(' ');
}
