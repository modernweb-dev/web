import { Server } from '@web/test-runner-core';
import { DevServerCoreConfig, DevServer, Plugin } from '@web/dev-server-core';
import deepmerge from 'deepmerge';
import chokidar from 'chokidar';

import { watchFilesMiddleware } from '../middleware/watchFilesMiddleware';
import { cacheMiddleware } from '../middleware/cacheMiddleware';
import { testRunnerApiMiddleware } from '../middleware/testRunnerApiMiddleware';
import { serveTestRunnerHtmlPlugin } from '../plugins/serveTestRunnerHtmlPlugin';
import { serveTestFrameworkPlugin } from '../plugins/serveTestFrameworkPlugin';
import { TestRunnerServerConfig } from './TestRunnerServerConfig';

const CACHED_PATTERNS = [
  'node_modules/@web/test-runner-',
  'node_modules/mocha/',
  'node_modules/chai/',
];
const isDefined = (_: unknown) => Boolean(_);

export function testRunnerServer(testRunnerServerConfig: TestRunnerServerConfig = {}): Server {
  const { plugins = [] } = testRunnerServerConfig;
  let devServer: DevServer;

  return {
    async start({ config, sessions, runner }) {
      const { testFramework, rootDir } = config;
      const { testFrameworkImport, testFrameworkPlugin } = testFramework
        ? serveTestFrameworkPlugin(testFramework)
        : ({} as { testFrameworkImport?: string; testFrameworkPlugin?: Plugin });

      const fileWatcher = chokidar.watch([]);
      const serverConfig = deepmerge.all<DevServerCoreConfig>([
        {
          port: config.port,
          hostname: config.hostname,
          rootDir,

          mimeTypes: testRunnerServerConfig.mimeTypes,
          middleware: [
            testRunnerApiMiddleware(sessions, rootDir, config, plugins),
            watchFilesMiddleware({ runner, sessions, rootDir, fileWatcher }),
            cacheMiddleware(CACHED_PATTERNS, config.watch),
            ...(testRunnerServerConfig.middleware || []),
          ],

          plugins: [
            serveTestRunnerHtmlPlugin(config, testFrameworkImport),
            testFrameworkPlugin,
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
