import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { SeleniumLauncher } from '@web/test-runner-selenium';
import webdriver, { Capabilities } from 'selenium-webdriver';
import browserstack from 'browserstack-local';
import ip from 'ip';
import {
  registerBrowserstackLocal,
  unregisterBrowserstackLocal,
  localId,
} from './browserstackManager';

export interface BrowserstackLauncherArgs {
  capabilities: Record<string, unknown>;
  localOptions?: Partial<browserstack.Options>;
}

const REQUIRED_CAPABILITIES = ['name', 'browserstack.user', 'browserstack.key', 'project', 'build'];
const localIp = ip.address();

export class BrowserstackLauncher extends SeleniumLauncher {
  constructor(
    private capabilities: Capabilities,
    public name: string,
    private localOptions?: Partial<browserstack.Options>,
  ) {
    super(
      new webdriver.Builder()
        .usingServer('http://hub.browserstack.com/wd/hub')
        .withCapabilities(capabilities),
    );
  }

  async start(config: TestRunnerCoreConfig) {
    await registerBrowserstackLocal(
      this,
      this.capabilities.get('browserstack.key')!,
      this.localOptions,
    );
    await super.start(config);
  }

  startSession(sessionId: string, url: string) {
    return super.startSession(sessionId, url.replace(/(localhost|127\.0\.0\.1)/, localIp));
  }

  async startDebugSession() {
    throw new Error('Starting a debug session is not supported in browserstack');
  }

  async stop() {
    await unregisterBrowserstackLocal(this);
    return super.stop();
  }
}

export function browserstackLauncher(args: BrowserstackLauncherArgs): BrowserLauncher {
  if (!args || !args.capabilities) {
    throw new Error('Missing capabilities in browserstackLauncher');
  }

  for (const capability of REQUIRED_CAPABILITIES) {
    if (!args.capabilities[capability]) {
      throw new Error(`Missing capability: ${capability} in browserstack launcher config.`);
    }
  }

  const caps = args.capabilities;
  const browserName =
    `${caps.browser ?? caps.browserName ?? caps.device ?? 'unknown'}${
      caps.browser_version ? ` ${caps.browser_version}` : ''
    }` + ` (${caps.os} ${caps.os_version})`;

  const capabilitiesMap = new Map(Object.entries(args.capabilities));
  const capabilities = new Capabilities(capabilitiesMap);
  capabilities.set('timeout', 300);
  capabilities.set('browserstack.local', true);
  capabilities.set('browserstack.localIdentifier', localId);

  // we need to allow popups since we open new windows
  capabilities.set('browserstack.ie.enablePopups', true);
  capabilities.set('browserstack.edge.enablePopups', true);
  capabilities.set('browserstack.safari.enablePopups', true);

  return new BrowserstackLauncher(capabilities, browserName, args.localOptions);
}
