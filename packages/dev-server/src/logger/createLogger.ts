import { Plugin } from '@web/dev-server-core';
import { DevServerLogger } from './DevServerLogger';
import { logStartMessage } from './logStartMessage';

const CLEAR_COMMAND = process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[H';

export interface LoggerArgs {
  debugLogging: boolean;
  clearTerminalOnReload: boolean;
  logStartMessage: boolean;
}

export function createLogger(args: LoggerArgs): { logger: DevServerLogger; loggerPlugin: Plugin } {
  let onSyntaxError: (msg: string) => void;

  const logger = new DevServerLogger(args.debugLogging, msg => onSyntaxError?.(msg));

  return {
    logger,
    loggerPlugin: {
      name: 'logger',

      serverStart({ config, logger, fileWatcher, webSockets }) {
        if (webSockets) {
          onSyntaxError = function onSyntaxError(msg) {
            webSockets.sendConsoleLog(msg);
          };
        }

        function logStartup(skipClear = false) {
          if (!skipClear && args.clearTerminalOnReload) {
            process.stdout.write(CLEAR_COMMAND);
          }
          logStartMessage(config, logger);
        }

        if (args.logStartMessage) {
          logStartup(true);
        }

        if (args.clearTerminalOnReload) {
          fileWatcher.addListener('change', () => logStartup());
          fileWatcher.addListener('unlink', () => logStartup());
        }
      },
    },
  };
}
