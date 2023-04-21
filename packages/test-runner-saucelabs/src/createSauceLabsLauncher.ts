import { BrowserLauncher } from '@web/test-runner-core';
import { SauceLabsOptions, SauceConnectOptions } from 'saucelabs';
import WebDriver from 'webdriver';
import { RemoteOptions } from 'webdriverio';
import { Options } from '@wdio/types';
import { nanoid } from 'nanoid';

import { SauceLabsLauncher } from './SauceLabsLauncher';
import { SauceLabsLauncherManager } from './SauceLabsLauncherManager';

export function createSauceLabsLauncher(
  saucelabsOptions: SauceLabsOptions,
  saucelabsCapabilities?: WebDriver.DesiredCapabilities,
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
    finalConnectOptions.tunnelIdentifier = `web-test-runner-${nanoid()}`;
  }
  const manager = new SauceLabsLauncherManager(finalSauceLabsOptions, finalConnectOptions);

  return function sauceLabsLauncher(capabilities: WebDriver.DesiredCapabilities): BrowserLauncher {
    if (capabilities == null) {
      throw new Error('Capabilities are required.');
    }

    let finalCapabilities = { ...capabilities };

    const finalSauceCapabilities = {
      tunnelIdentifier: finalConnectOptions.tunnelIdentifier,
      ...saucelabsCapabilities,
    };

    // W3C capabilities: only browserVersion is mandatory, platformName is optional.
    // Note that setting 'sauce:options' forces Sauce Labs to use W3C capabilities.
    if (capabilities.browserVersion) {
      // version is not a valid W3C key.
      delete finalCapabilities.version;

      // platform is not a valid W3C key and will throw, use platformName instead.
      if (capabilities.platform) {
        finalCapabilities.platformName =
          finalCapabilities.platformName || finalCapabilities.platform;
        delete finalCapabilities.platform;
      }

      finalCapabilities['sauce:options'] = {
        ...finalSauceCapabilities,
        ...(finalCapabilities['sauce:options'] || {}),
      };
    } else {
      // JWP capabilities for remote environments not yet supporting W3C.
      // This enables running tests on iPhone Simulators in Sauce Labs.
      finalCapabilities = { ...finalCapabilities, ...finalSauceCapabilities };
    }

    // Type cast to not fail on snake case syntax e.g. browser_version.
    const caps = finalCapabilities as Record<string, string>;

    const browserName = caps.browserName ?? caps.browser ?? caps.device ?? 'unknown';
    const browserVersion = caps.browserVersion ?? caps.version ?? caps.browser_version ?? '';
    const platform = caps.platformName ?? caps.platform ?? '';

    const browserIdentifier = `${browserName}${browserVersion}${platform}`;

    const options: RemoteOptions = {
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
