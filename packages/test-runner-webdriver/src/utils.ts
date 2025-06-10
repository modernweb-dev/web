function getPlatform(c: WebdriverIO.Capabilities): string | undefined {
  return c.platformName;
}

export function getBrowserName(c: WebdriverIO.Capabilities): string | undefined {
  return c.browserName;
}

function getBrowserVersion(c: WebdriverIO.Capabilities): string | undefined {
  return c.browserVersion;
}

export function getBrowserLabel(c: WebdriverIO.Capabilities): string {
  return [getPlatform(c), getBrowserName(c), getBrowserVersion(c)].filter(_ => _).join(' ');
}
