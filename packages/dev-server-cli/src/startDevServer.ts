import { DevServer } from '@web/dev-server-core';

import { DevServerLogger } from './logger/DevServerLogger';
import { DevServerCliConfig } from './config/DevServerCliConfig';
import { openBrowser } from './openBrowser';
import { loggerPlugin } from './logger/loggerPlugin';

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
  config.plugins = config.plugins ?? [];
  config.plugins.push(
    loggerPlugin({
      clearTerminalOnChange,
      logStartMessage,
    }),
  );

  const logger = new DevServerLogger();
  const server = new DevServer(config, logger);

  function stop() {
    server.stop();
  }

  if (autoExitProcess) {
    (['exit', 'SIGINT'] as NodeJS.Signals[]).forEach(event => {
      process.on(event, stop);
    });
  }

  if (autoExitProcess) {
    process.on('uncaughtException', error => {
      /* eslint-disable-next-line no-console */
      console.error(error);
      stop();
    });
  }

  await server.start();

  if (config.open != null) {
    await openBrowser(config);
  }

  return server;
}
