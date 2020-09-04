import { DevServer } from '@web/dev-server-core';

import { DevServerCliConfig } from './config/DevServerCliConfig';
import { openBrowser } from './openBrowser';
import { createLogger } from './logger/createLogger';

export interface StartDevServerOptions {
  autoExitProcess?: boolean;
  clearTerminalOnChange?: boolean;
  logStartMessage?: boolean;
}

export async function startDevServer(
  config: DevServerCliConfig,
  options: StartDevServerOptions = {},
) {
  const { autoExitProcess = true, clearTerminalOnChange = false, logStartMessage = true } = options;
  const { logger, loggerPlugin } = createLogger({
    // TODO: read debug
    debugLogging: false,
    clearTerminalOnChange,
    logStartMessage,
  });
  config.plugins = config.plugins ?? [];
  config.plugins.push(loggerPlugin);

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

  await server.start();

  if (config.open != null) {
    await openBrowser(config);
  }

  return server;
}
