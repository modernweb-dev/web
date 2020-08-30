import { DevServer } from '@web/dev-server-core';

import { DevServerLogger } from './logger/DevServerLogger';
import { DevServerCliConfig } from './config/DevServerCliConfig';
import { openBrowser } from './openBrowser';
import { logStartMessage as logStartMessageFunction } from './logStartMessage';

export interface StartDevServerOptions {
  autoExitProcess?: boolean;
  logStartMessage?: boolean;
}

export async function startDevServer(
  config: DevServerCliConfig,
  options: StartDevServerOptions = {},
) {
  const { autoExitProcess = true, logStartMessage = true } = options;
  const logger = new DevServerLogger();
  const server = new DevServer(config, logger);

  if (autoExitProcess) {
    process.on('uncaughtException', error => {
      /* eslint-disable-next-line no-console */
      console.error(error);
      stop();
    });

    process.on('SIGINT', async () => {
      await server.stop();
      process.exit(0);
    });
  }

  if (logStartMessage) {
    logStartMessageFunction(config, logger);
  }

  await server.start();

  if (config.open != null) {
    await openBrowser(config);
  }

  return server;
}
