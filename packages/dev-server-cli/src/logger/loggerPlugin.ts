import { Plugin } from '@web/dev-server-core';
import { logStartMessage } from './logStartMessage';

const CLEAR_COMMAND = process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';

export interface LoggerPluginArgs {
  clearTerminalOnChange: boolean;
  logStartMessage: boolean;
}

export function loggerPlugin(args: LoggerPluginArgs): Plugin {
  return {
    name: 'logger',

    serverStart({ config, logger, fileWatcher }) {
      if (args.logStartMessage) {
        process.stdout.write(CLEAR_COMMAND);
        logStartMessage(config, logger);
      }

      function onChange() {
        if (args.clearTerminalOnChange) {
          process.stdout.write(CLEAR_COMMAND);
          logStartMessage(config, logger);
        }
      }

      fileWatcher.addListener('change', onChange);
      fileWatcher.addListener('unlink', onChange);
    },
  };
}
