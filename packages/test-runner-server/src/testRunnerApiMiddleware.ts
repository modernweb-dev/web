import { Middleware } from '@web/dev-server-core';
import {
  TestSessionManager,
  TestRunnerCoreConfig,
  SESSION_STATUS,
  Viewport,
} from '@web/test-runner-core';
import parse from 'co-body';
import path from 'path';

import { toBrowserPath } from './utils';

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
): Middleware {
  return async (ctx, next) => {
    if (ctx.path.startsWith('/wtr/')) {
      const [, , sessionId, command] = ctx.path.split('/');
      const debug = ctx.URL.searchParams.get('debug') === 'true';
      if (!sessionId) return next();
      if (!command) return next();

      const session = sessions.get(sessionId);
      if (!session) {
        ctx.status = 400;
        ctx.body = `Session id ${sessionId} not found`;
        console.error(ctx.body);
        return;
      }

      if (command === 'config') {
        ctx.body = JSON.stringify({
          testFile: createBrowserFilePath(rootDir, session.testFile, sessionId),
          watch: !!config.watch,
          testFrameworkConfig: config.testFramework?.config,
        });
        return;
      }

      if (command === 'session-started') {
        ctx.status = 200;
        if (debug) return;

        sessions.update({
          ...session,
          status: SESSION_STATUS.TEST_STARTED,
          userAgent: ctx.headers['user-agent'],
        });
        return;
      }

      if (command === 'viewport') {
        try {
          const viewport = ((await parse.json(ctx)) as any) as Viewport;
          await session.browserLauncher.setViewport(session, viewport);
          ctx.status = 200;
        } catch (error) {
          console.error(error);
          ctx.status = 500;
        }
        return;
      }

      if (command === 'session-finished') {
        ctx.status = 200;
        if (debug) return;

        const result = (await parse.json(ctx)) as any;
        sessions.updateStatus({ ...session, ...result }, SESSION_STATUS.TEST_FINISHED);
        return;
      }
    }

    return next();
  };
}
