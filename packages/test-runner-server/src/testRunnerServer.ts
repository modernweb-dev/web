import { Server } from '@web/test-runner-core';
import { DevServerCoreConfig, DevServer, Plugin } from '@web/dev-server-core';
import deepmerge from 'deepmerge';
import chokidar from 'chokidar';

import { watchFilesMiddleware } from './watchFilesMiddleware';
import { serveTestRunnerHtmlPlugin } from './serveTestRunnerHtmlPlugin';
import { cacheMiddleware } from './cacheMiddleware';
import { testRunnerApiMiddleware } from './testRunnerApiMiddleware';
import { TestRunnerServerConfig } from './TestRunnerServerConfig';
import { serveTestFrameworkPlugin } from './serveTestFrameworkPlugin';

const CACHED_PATTERNS = [
  'node_modules/@web/test-runner-',
  'node_modules/mocha/',
  'node_modules/chai/',
];
const isDefined = (_: unknown) => Boolean(_);

export function testRunnerServer(testRunnerServerConfig: TestRunnerServerConfig = {}): Server {
  let devServer: DevServer;

  return {
    async start({ config, sessions, runner }) {
      const { testFramework, rootDir } = config;

      const fileWatcher = chokidar.watch([]);
      const serverConfig = deepmerge.all<DevServerCoreConfig>([
        {
          port: config.port,
          hostname: config.hostname,
          rootDir,

          middleware: [
            testRunnerApiMiddleware(sessions, rootDir, config),
            watchFilesMiddleware({ runner, sessions, rootDir, fileWatcher }),
            cacheMiddleware(CACHED_PATTERNS, config.watch),
            ...(testRunnerServerConfig.middleware || []),
          ],

          plugins: [
            serveTestRunnerHtmlPlugin(config),
            testFramework && serveTestFrameworkPlugin(testFramework),
            ...(testRunnerServerConfig.plugins || []),
          ].filter(isDefined) as Plugin[],
        },
      ]);

      devServer = new DevServer(serverConfig, config.logger, fileWatcher);
      await devServer.start();
    },

    async stop() {
      await devServer?.stop();
    },
  };
}
