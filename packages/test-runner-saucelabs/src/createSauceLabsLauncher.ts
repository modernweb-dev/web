import { BrowserLauncher } from '@web/test-runner-core';
import { SauceLabsOptions, SauceConnectOptions } from 'saucelabs';
import { Capabilities } from 'selenium-webdriver';
import { v4 as uuid } from 'uuid';

import { SauceLabsLauncher } from './SauceLabsLauncher';
import { SauceLabsLauncherManager } from './SauceLabsLauncherManager';

export function createSauceLabsLauncher(
  saucelabsOptions: SauceLabsOptions,
  sauceConnectOptions?: SauceConnectOptions,
) {
  if (saucelabsOptions == null) {
    throw new Error('Options are required to set user and key.');
  }

  if (typeof saucelabsOptions.user !== 'string') {
    throw new Error('Missing user in options');
  }

  if (typeof saucelabsOptions.key !== 'string') {
    throw new Error('Missing key in options');
  }

  const finalSauceLabsOptions = { ...saucelabsOptions };
  if (typeof finalSauceLabsOptions.region !== 'string') {
    finalSauceLabsOptions.region = 'us';
  }

  const finalConnectOptions: SauceConnectOptions = { ...sauceConnectOptions };
  if (typeof finalConnectOptions.tunnelIdentifier !== 'string') {
    finalConnectOptions.tunnelIdentifier = `web-test-runner-${uuid()}`;
  }
  const manager = new SauceLabsLauncherManager(finalSauceLabsOptions, finalConnectOptions);

  return function sauceLabsLauncher(capabilities: Record<string, unknown>): BrowserLauncher {
    if (capabilities == null) {
      throw new Error('Capabilities are required.');
    }
    const finalCapabilities = { ...capabilities };

    // sync the tunnel identifier, username and access key
    finalCapabilities['sauce:options'] = {
      ...(finalCapabilities['sauce:options'] as Record<string, unknown>),
      username: saucelabsOptions.user,
      accessKey: saucelabsOptions.key,
      tunnelIdentifier: finalConnectOptions.tunnelIdentifier,
    };

    const browserName =
      finalCapabilities.browser ??
      finalCapabilities.browserName ??
      finalCapabilities.device ??
      'unknown';
    const browserVersion = finalCapabilities.browser_version
      ? ` ${finalCapabilities.browser_version}`
      : '';
    const os = ` (${finalCapabilities.os} ${finalCapabilities.os_version})`;
    const browserIdentifier = `${browserName}${browserVersion}${os}`;

    const capabilitiesMap = new Map(Object.entries(finalCapabilities));
    const seleniumCapabilities = new Capabilities(capabilitiesMap);

    return new SauceLabsLauncher(
      manager,
      browserIdentifier,
      manager.webdriverEndpoint,
      seleniumCapabilities,
    );
  };
}
