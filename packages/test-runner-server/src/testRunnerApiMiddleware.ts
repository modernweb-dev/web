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
        });
        return;
      }

      // TODO: Handle race conditions for these requests
      if (command === 'session-started') {
        ctx.status = 200;
        sessions.updateStatus(session, SESSION_STATUS.STARTED);
        return;
      }

      if (command === 'viewport') {
        try {
          if (session.status !== SESSION_STATUS.STARTED) {
            ctx.status = 400;
            return;
          }
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
        const result = (await parse.json(ctx)) as any;
        sessions.updateStatus({ ...session, ...result }, SESSION_STATUS.FINISHED);
        return;
      }
    }

    return next();
  };
}
