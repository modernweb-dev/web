import { DevServerConfig } from '../config/DevServerConfig';
import { Logger } from '@web/dev-server-core';
import ip from 'ip';
import { bold, cyan, white } from 'nanocolors';

const createAddress = (config: DevServerConfig, host: string, path: string) =>
  `http${config.http2 ? 's' : ''}://${host}:${config.port}${path}`;

function logNetworkAddress(config: DevServerConfig, logger: Logger, openPath: string) {
  try {
    const address = ip.address();
    if (typeof address === 'string') {
      logger.log(`${white('Network:')}  ${cyan(createAddress(config, address, openPath))}`);
    }
  } catch {
    //
  }
}

export function logStartMessage(config: DevServerConfig, logger: Logger) {
  const prettyHost = config.hostname ?? 'localhost';
  let openPath = typeof config.open === 'string' ? config.open : '/';
  if (!openPath.startsWith('/')) {
    openPath = `/${openPath}`;
  }

  logger.log(bold('Web Dev Server started...'));
  logger.log('');

  logger.group();
  logger.log(`${white('Root dir:')} ${cyan(config.rootDir)}`);
  logger.log(`${white('Local:')}    ${cyan(createAddress(config, prettyHost, openPath))}`);
  logNetworkAddress(config, logger, openPath);
  logger.groupEnd();
  logger.log('');
}
