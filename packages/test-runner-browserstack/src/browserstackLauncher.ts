import { BrowserLauncher, TestSession } from '@web/test-runner-core';
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
    private localOptions?: Partial<browserstack.Options>,
  ) {
    super(
      new webdriver.Builder()
        .usingServer('http://hub.browserstack.com/wd/hub')
        .withCapabilities(capabilities),
    );
  }

  async start() {
    await registerBrowserstackLocal(
      this,
      this.capabilities.get('browserstack.key')!,
      this.localOptions,
    );
    return super.start();
  }

  startSession(session: TestSession, url: string) {
    return super.startSession(session, url.replace('localhost', localIp));
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

  const capabilitiesMap = new Map(Object.entries(args.capabilities));
  const capabilities = new Capabilities(capabilitiesMap);
  capabilities.set('timeout', 300);
  capabilities.set('browserstack.local', true);
  capabilities.set('browserstack.localIdentifier', localId);

  return new BrowserstackLauncher(capabilities, args.localOptions);
}
