/**
 * Manages browserstack-local instance, making sure there is only one per
 * instance set up for all browser launchers.
 */

import browserstack from 'browserstack-local';
import { BrowserLauncher } from '@web/test-runner-core';
import { promisify } from 'util';
import { nanoid } from 'nanoid';

const launchers = new Set<BrowserLauncher>();
let connection: browserstack.Local | undefined = undefined;

export const localId = `web-test-runner-${nanoid()}`;

async function setupLocalConnection(password: string, options: Partial<browserstack.Options> = {}) {
  process.on('SIGINT', closeLocalConnection);
  process.on('SIGTERM', closeLocalConnection);
  process.on('beforeExit', closeLocalConnection);
  process.on('exit', closeLocalConnection);

  connection = new browserstack.Local();

  console.log('[Browserstack] Setting up Browserstack Local proxy...');
  await promisify(connection.start).bind(connection)({
    key: password,
    force: true,
    localIdentifier: localId,
    ...options,
  });
}

function closeLocalConnection() {
  if (connection && (connection as any).pid != null) {
    process.kill((connection as any).pid);
    connection = undefined;
  }
}

export async function registerBrowserstackLocal(
  launcher: BrowserLauncher,
  password: string,
  options: Partial<browserstack.Options> = {},
) {
  launchers.add(launcher);

  if (!connection) {
    await setupLocalConnection(password, options);
  }
}

export function unregisterBrowserstackLocal(launcher: BrowserLauncher) {
  launchers.delete(launcher);

  if (connection && launchers.size === 0) {
    closeLocalConnection();
  }
}
