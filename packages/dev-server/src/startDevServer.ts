import { DevServer } from '@web/dev-server-core';
import { DevServerConfig } from './config/DevServerConfig.js';
import { mergeConfigs } from './config/mergeConfigs.js';
import { parseConfig } from './config/parseConfig.js';
import { readCliArgs } from './config/readCliArgs.js';
import { readFileConfig } from './config/readFileConfig.js';
import { DevServerStartError } from './DevServerStartError.js';
import { createLogger } from './logger/createLogger.js';
import { openBrowser } from './openBrowser.js';

export interface StartDevServerParams {
  /**
   * Optional config to merge with the user-defined config.
   */
  config?: Partial<DevServerConfig>;
  /**
   * Whether to read CLI args. Default true.
   */
  readCliArgs?: boolean;
  /**
   * Whether to read a user config from the file system. Default true.
   */
  readFileConfig?: boolean;
  /**
   * Name of the configuration to read. Defaults to web-dev-server.config.{mjs,cjs,js}
   */
  configName?: string;
  /**
   * Whether to automatically exit the process when the server is stopped, killed or an error is thrown.
   */
  autoExitProcess?: boolean;
  /**
   * Whether to log a message when the server is started.
   */
  logStartMessage?: boolean;
  /**
   * Array to read the CLI args from. Defaults to process.argv.
   */
  argv?: string[];
}

/**
 * Starts the dev server.
 */
export async function startDevServer(options: StartDevServerParams = {}) {
  const {
    config: extraConfig,
    readCliArgs: readCliArgsFlag = true,
    readFileConfig: readFileConfigFlag = true,
    configName,
    autoExitProcess = true,
    logStartMessage = true,
    argv = process.argv,
  } = options;

  try {
    const cliArgs = readCliArgsFlag ? readCliArgs({ argv }) : {};
    const rawConfig = readFileConfigFlag
      ? await readFileConfig({ configName, configPath: cliArgs.config })
      : {};
    const mergedConfig = mergeConfigs(extraConfig, rawConfig);
    const config = await parseConfig(mergedConfig, cliArgs);

    const { logger, loggerPlugin } = createLogger({
      debugLogging: !!config.debug,
      clearTerminalOnReload: !!config.watch && !!config.clearTerminalOnReload,
      logStartMessage: !!logStartMessage,
    });
    config.plugins = config.plugins ?? [];
    config.plugins.unshift(loggerPlugin);

    const server = new DevServer(config, logger);

    if (autoExitProcess) {
      process.on('uncaughtException', error => {
        /* eslint-disable-next-line no-console */
        console.error(error);
      });

      process.on('SIGINT', async () => {
        await server.stop();
        process.exit(0);
      });
    }

    await server.start();

    if (config.open != null && config.open !== false) {
      await openBrowser(config);
    }

    return server;
  } catch (error) {
    if (error instanceof DevServerStartError) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}
