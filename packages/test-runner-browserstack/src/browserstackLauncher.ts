import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { WebdriverLauncher } from '@web/test-runner-webdriver';
import browserstack from 'browserstack-local';
import internalIp from 'internal-ip';
import {
  registerBrowserstackLocal,
  unregisterBrowserstackLocal,
  localId,
} from './browserstackManager.js';

export interface BrowserstackLauncherArgs {
  capabilities: Record<string, unknown>;
  localOptions?: Partial<browserstack.Options>;
}

const REQUIRED_CAPABILITIES = ['name', 'browserstack.user', 'browserstack.key', 'project', 'build'];
const localIp = internalIp.v4.sync() as string;
if (!localIp) {
  throw new Error('Can not determine the local IP.');
}

export class BrowserstackLauncher extends WebdriverLauncher {
  constructor(
    private capabilities: Record<string, unknown>,
    public name: string,
    private localOptions?: Partial<browserstack.Options>,
  ) {
    super({
      capabilities: capabilities,
      hostname: 'hub.browserstack.com',
      protocol: 'http',
      port: 80,
      path: '/wd/hub',
      user: capabilities['browserstack.user'] as string,
      key: capabilities['browserstack.key'] as string,
    });
  }

  async initialize(config: TestRunnerCoreConfig) {
    await registerBrowserstackLocal(
      this,
      this.capabilities['browserstack.key'] as string,
      this.localOptions,
    );
    await super.initialize(config);
  }

  startSession(sessionId: string, url: string) {
    return super.startSession(sessionId, url.replace(/(localhost|127\.0\.0\.1)/, localIp));
  }

  async startDebugSession() {
    throw new Error('Starting a debug session is not supported in browserstack');
  }

  stop() {
    const stopPromise = super.stop();
    unregisterBrowserstackLocal(this);
    return stopPromise;
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

  const capabilities = { ...args.capabilities };
  capabilities['timeout'] = 300;
  capabilities['browserstack.local'] = true;
  capabilities['browserstack.localIdentifier'] = localId;

  // we need to allow popups since we open new windows
  capabilities['browserstack.ie.enablePopups'] = true;
  capabilities['browserstack.edge.enablePopups'] = true;
  capabilities['browserstack.safari.enablePopups'] = true;

  return new BrowserstackLauncher(capabilities, browserName, args.localOptions);
}
