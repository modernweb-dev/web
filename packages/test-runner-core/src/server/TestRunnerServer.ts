import { DevServer, Plugin } from '@web/dev-server-core';
import chokidar from 'chokidar';

import { RunSessions, watchFilesMiddleware } from './middleware/watchFilesMiddleware';
import { cacheMiddleware } from './middleware/cacheMiddleware';
import { testRunnerApiMiddleware } from './middleware/testRunnerApiMiddleware';
import { serveTestRunnerHtmlPlugin } from './plugins/serveTestRunnerHtmlPlugin';
import { serveTestFrameworkPlugin } from './plugins/serveTestFrameworkPlugin';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestSessionManager } from '../test-session/TestSessionManager';

const CACHED_PATTERNS = [
  'node_modules/@web/test-runner-',
  'node_modules/mocha/',
  'node_modules/chai/',
];
const isDefined = (_: unknown) => Boolean(_);

export class TestRunnerServer {
  private devServer: DevServer;
  private fileWatcher = chokidar.watch([]);

  constructor(
    config: TestRunnerCoreConfig,
    sessions: TestSessionManager,
    testFiles: string[],
    runSessions: RunSessions,
  ) {
    const { plugins = [], testFramework, rootDir } = config;

    const { testFrameworkImport, testFrameworkPlugin } = testFramework
      ? serveTestFrameworkPlugin(testFramework)
      : ({} as { testFrameworkImport?: string; testFrameworkPlugin?: Plugin });
    const serverConfig = {
      port: config.port,
      hostname: config.hostname,
      rootDir,

      mimeTypes: config.mimeTypes,
      middleware: [
        testRunnerApiMiddleware(sessions, rootDir, config, plugins),
        watchFilesMiddleware({ runSessions, sessions, rootDir, fileWatcher: this.fileWatcher }),
        cacheMiddleware(CACHED_PATTERNS, config.watch),
        ...(config.middleware || []),
      ],

      plugins: [
        serveTestRunnerHtmlPlugin(config, testFiles, testFrameworkImport),
        testFrameworkPlugin,
        ...(config.plugins || []),
      ].filter(isDefined) as Plugin[],
    };

    this.devServer = new DevServer(serverConfig, config.logger, this.fileWatcher);
  }

  async start() {
    await this.devServer.start();
  }

  async stop() {
    await this.devServer.stop();
  }
}
