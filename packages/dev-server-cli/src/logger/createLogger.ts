import { Plugin } from '@web/dev-server-core';
import { DevServerLogger } from './DevServerLogger';
import { logStartMessage } from './logStartMessage';

const CLEAR_COMMAND = process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';

export interface LoggerArgs {
  debugLogging: boolean;
  clearTerminalOnChange: boolean;
  logStartMessage: boolean;
}

export function createLogger(args: LoggerArgs): { logger: DevServerLogger; loggerPlugin: Plugin } {
  let onSyntaxError: (msg: string) => void;

  const logger = new DevServerLogger(args.debugLogging, msg => onSyntaxError?.(msg));

  return {
    logger,
    loggerPlugin: {
      name: 'logger',

      serverStart({ config, logger, fileWatcher, eventStreams }) {
        if (eventStreams) {
          onSyntaxError = function onSyntaxError(msg) {
            eventStreams.sendMessageEvent(msg);
          };
        }

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
    },
  };
}
