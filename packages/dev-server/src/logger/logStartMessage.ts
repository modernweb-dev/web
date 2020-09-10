import { DevServerConfig } from '../config/DevServerConfig';
import { Logger } from '@web/dev-server-core';
import ip from 'ip';
import chalk from 'chalk';

const createAddress = (config: DevServerConfig, host: string, path: string) =>
  `http${config.http2 ? 's' : ''}://${host}:${config.port}${path}`;

function logNetworkAddress(config: DevServerConfig, logger: Logger, openPath: string) {
  try {
    const address = ip.address();
    if (typeof address === 'string') {
      logger.log(
        `${chalk.white('Network:')}  ${chalk.cyanBright(createAddress(config, address, openPath))}`,
      );
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

  logger.log(chalk.bold('Web Dev Server started...'));
  logger.log('');

  logger.group();
  logger.log(`${chalk.white('Root dir:')} ${chalk.cyanBright(config.rootDir)}`);
  logger.log(
    `${chalk.white('Local:')}    ${chalk.cyanBright(createAddress(config, prettyHost, openPath))}`,
  );
  logNetworkAddress(config, logger, openPath);
  logger.groupEnd();
  logger.log('');
}
