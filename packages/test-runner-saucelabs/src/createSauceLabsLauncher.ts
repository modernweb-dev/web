import { BrowserLauncher } from '@web/test-runner-core';
import { SauceLabsOptions, SauceConnectOptions } from 'saucelabs';
import { Capabilities, Options } from '@wdio/types';
import { nanoid } from 'nanoid';
import { SauceLabsLauncher } from './SauceLabsLauncher.js';
import { SauceLabsLauncherManager } from './SauceLabsLauncherManager.js';

export function createSauceLabsLauncher(
  saucelabsOptions: SauceLabsOptions,
  saucelabsCapabilities?: WebdriverIO.Capabilities['sauce:options'],
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
  if (typeof finalConnectOptions.tunnelName !== 'string') {
    finalConnectOptions.tunnelName = `web-test-runner-${nanoid()}`;
  }
  const manager = new SauceLabsLauncherManager(finalSauceLabsOptions, finalConnectOptions);

  return function sauceLabsLauncher(capabilities: WebdriverIO.Capabilities): BrowserLauncher {
    if (capabilities == null) {
      throw new Error('Capabilities are required.');
    }

    const finalCapabilities = { ...capabilities };

    const finalSauceCapabilities = {
      tunnelName: finalConnectOptions.tunnelName,
      ...saucelabsCapabilities,
    };

    finalCapabilities['sauce:options'] = {
      ...finalSauceCapabilities,
      ...(finalCapabilities['sauce:options'] || {}),
    };

    // Type cast to not fail on snake case syntax e.g. browser_version.
    const caps = finalCapabilities as Record<string, string>;

    const browserName = caps.browserName ?? 'unknown';
    const browserVersion = caps.browserVersion ?? '';
    const platform = caps.platformName ?? '';

    const browserIdentifier = `${browserName}${browserVersion}${platform}`;

    const options: Capabilities.WebdriverIOConfig = {
      user: finalSauceLabsOptions.user,
      key: finalSauceLabsOptions.key,
      region: finalSauceLabsOptions.region as Options.SauceRegions,
      logLevel: 'error',
      capabilities: {
        ...finalCapabilities,
      },
    };

    return new SauceLabsLauncher(manager, browserIdentifier, options);
  };
}
