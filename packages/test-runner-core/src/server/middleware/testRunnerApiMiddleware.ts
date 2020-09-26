import { Middleware } from '@web/dev-server-core';
import { deserialize } from '@web/browser-logs';
import parse from 'co-body';
import { SESSION_STATUS } from '../../test-session/TestSessionStatus';
import { TestRunnerCoreConfig } from '../../config/TestRunnerCoreConfig';
import { TestSessionManager } from '../../test-session/TestSessionManager';
import { TestRunnerPlugin } from '../TestRunnerPlugin';

import { createTestFileImportPath } from '../utils';

export function testRunnerApiMiddleware(
  sessions: TestSessionManager,
  rootDir: string,
  config: TestRunnerCoreConfig,
  plugins: TestRunnerPlugin[],
): Middleware {
  return async (ctx, next) => {
    if (ctx.path.startsWith('/wtr/')) {
      // config for testing by test file
      if (ctx.path === '/wtr/test-config') {
        ctx.status = 200;
        ctx.body = JSON.stringify({
          watch: !!config.watch,
          debug: true,
          testFrameworkConfig: config.testFramework?.config,
        });
        return;
      }

      const [, , sessionId, endpoint, ...restParameters] = ctx.path.split('/');
      if (!sessionId) return next();
      if (!endpoint) return next();

      const session = sessions.get(sessionId) || sessions.getDebug(sessionId);
      if (!session) {
        ctx.status = 400;
        ctx.body = `Session id ${sessionId} not found`;
        console.error(ctx.body);
        return;
      }

      // config for test session
      if (endpoint === 'config') {
        const testFile = await createTestFileImportPath(config, ctx, session.testFile, sessionId);

        ctx.body = JSON.stringify({
          testFile,
          watch: !!config.watch,
          debug: session.debug,
          testFrameworkConfig: config.testFramework?.config,
        });
        return;
      }

      if (endpoint === 'session-started') {
        ctx.status = 200;
        if (session.debug) return;

        sessions.updateStatus(
          {
            ...session,
            userAgent: ctx.headers['user-agent'],
          },
          SESSION_STATUS.TEST_STARTED,
        );
        return;
      }

      if (endpoint === 'session-finished') {
        ctx.status = 200;
        if (session.debug) return;

        const result = (await parse.json(ctx)) as any;
        if (result.logs) {
          result.logs = result.logs
            .map((log: any) => ({ type: log.type, args: log.args.map((a: any) => deserialize(a)) }))
            .filter((log: any) => (config.filterBrowserLogs ? config.filterBrowserLogs(log) : true))
            .map((log: any) => log.args);
        }
        sessions.updateStatus({ ...session, ...result }, SESSION_STATUS.TEST_FINISHED);
        return;
      }

      if (endpoint === 'command') {
        if (restParameters.length === 0) {
          throw new Error('A command name must be provided.');
        }

        if (restParameters.length === 1) {
          const [command] = restParameters;
          const { payload } = (await parse.json(ctx)) as { payload: unknown };
          for (const plugin of plugins) {
            try {
              const result = await plugin.executeCommand?.({ command, payload, session });

              if (result != null) {
                ctx.status = 200;
                ctx.body = JSON.stringify(result);
                return;
              }
            } catch (error) {
              config.logger.error(error);
              ctx.status = 500;
              return;
            }
          }
        }
      }
    }

    return next();
  };
}
