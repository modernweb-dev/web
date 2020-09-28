/**
 * Manages browserstack-local instance, making sure there is only one per
 * instance set up for all browser launchers.
 */

import browserstack from 'browserstack-local';
import { BrowserLauncher } from '@web/test-runner-core';
import { promisify } from 'util';
import { v4 as uuid } from 'uuid';

const launchers = new Set<BrowserLauncher>();
let connection: browserstack.Local | undefined = undefined;

export const localId = `web-test-runner-${uuid()}`;

export async function registerBrowserstackLocal(
  launcher: BrowserLauncher,
  password: string,
  options: Partial<browserstack.Options> = {},
) {
  if (!connection) {
    connection = new browserstack.Local();

    console.log('[Browserstack] Setting up Browserstack Local proxy...\n');
    await promisify(connection.start).bind(connection)({
      key: password,
      force: true,
      localIdentifier: localId,
      ...options,
    });
  }

  launchers.add(launcher);
}

export function unregisterBrowserstackLocal(launcher: BrowserLauncher) {
  launchers.delete(launcher);

  if (connection && launchers.size === 0) {
    if ((connection as any).pid != null) {
      process.kill((connection as any).pid);
    }
  }
}
