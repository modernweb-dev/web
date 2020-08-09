import { Middleware } from '@web/dev-server-core';
import parse from 'co-body';
import path from 'path';
import { SESSION_STATUS } from '../../test-session/TestSessionStatus';
import { TestRunnerCoreConfig } from '../../config/TestRunnerCoreConfig';
import { TestSessionManager } from '../../test-session/TestSessionManager';
import { TestRunnerPlugin } from '../TestRunnerPlugin';

import { toBrowserPath } from '../utils';
import { Viewport } from '../../browser-launcher/BrowserLauncher';

function createBrowserFilePath(rootDir: string, filePath: string, sessionId: string) {
  const fullFilePath = filePath.startsWith(process.cwd())
    ? filePath
    : path.join(process.cwd(), filePath);
  const relativeToRootDir = path.relative(rootDir, fullFilePath);
  return `${toBrowserPath(relativeToRootDir)}?wtr-session-id=${sessionId}`;
}

export function testRunnerApiMiddleware(
  sessions: TestSessionManager,
  rootDir: string,
  config: TestRunnerCoreConfig,
  plugins: TestRunnerPlugin[],
): Middleware {
  return async (ctx, next) => {
    if (ctx.path.startsWith('/wtr/')) {
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

      if (endpoint === 'config') {
        ctx.body = JSON.stringify({
          testFile: createBrowserFilePath(rootDir, session.testFile, sessionId),
          watch: !!config.watch,
          debug: session.debug,
          testFrameworkConfig: config.testFramework?.config,
        });
        return;
      }

      if (endpoint === 'session-started') {
        ctx.status = 200;
        if (session.debug) return;

        sessions.update({
          ...session,
          status: SESSION_STATUS.TEST_STARTED,
          userAgent: ctx.headers['user-agent'],
        });
        return;
      }

      if (endpoint === 'session-finished') {
        ctx.status = 200;
        if (session.debug) return;

        const result = (await parse.json(ctx)) as any;
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

      // deprecated, backwards compatibility
      if (endpoint === 'viewport') {
        try {
          const viewport = ((await parse.json(ctx)) as any) as Viewport;
          await session.browser.setViewport(session.id, viewport);
          ctx.status = 200;
        } catch (error) {
          console.error(error);
          ctx.status = 500;
        }
        return;
      }
    }

    return next();
  };
}
