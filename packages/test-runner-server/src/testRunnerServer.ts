import { Server, SESSION_STATUS } from '@web/test-runner-core';
import { createConfig, startServer, Config } from 'es-dev-server';
import deepmerge from 'deepmerge';
import { Context, Next } from 'koa';
import net from 'net';
import path from 'path';
import parse from 'co-body';
import chokidar from 'chokidar';
import { dependencyGraphMiddleware } from './dependencyGraphMiddleware';
import { createTestPage } from './createTestPage';
import { toBrowserPath } from './utils';

export { Config as ServerConfig };

const IGNORED_404s = ['favicon.ico'];

function createBrowserFilePath(rootDir: string, filePath: string) {
  const fullFilePath = filePath.startsWith(process.cwd())
    ? filePath
    : path.join(process.cwd(), filePath);
  const relativeToRootDir = path.relative(rootDir, fullFilePath);
  return toBrowserPath(relativeToRootDir);
}

export function testRunnerServer(devServerConfig: Partial<Config> = {}): Server {
  const rootDir = devServerConfig.rootDir ? path.resolve(devServerConfig.rootDir) : process.cwd();
  let server: net.Server;

  return {
    async start({ config, testFiles, sessions, runner }) {
      function onRerunSessions(sessionIds?: string[]) {
        const sessionsToRerun = sessionIds
          ? sessionIds.map(id => {
              const session = sessions.get(id);
              if (!session) {
                throw new Error(`Could not find session ${id}`);
              }
              return session;
            })
          : sessions.all();
        runner.runTests(sessionsToRerun);
      }

      function onRequest404(sessionId: string, url: string) {
        const session = sessions.get(sessionId);
        if (!session) {
          throw new Error(`Could not find session ${sessionId}`);
        }

        const { request404s } = session;
        if (!request404s.includes(url) && !IGNORED_404s.some(i => url.endsWith(i))) {
          sessions.update({ ...session, request404s: [...request404s, url] });
        }
      }

      const hasCustomBabelConfig = devServerConfig.babel || devServerConfig.babelConfig;
      let coverageExclude: string[] | undefined = undefined;
      let coverageInclude: string[] | undefined = undefined;
      if (config.coverage) {
        coverageExclude = [
          ...testFiles.map(t => path.resolve(t)),
          ...(config.coverageConfig!.exclude ?? []),
        ];
        coverageInclude = config.coverageConfig!.include;
      }

      const fileWatcher = chokidar.watch([]);
      const serverConfig = createConfig(
        deepmerge(
          {
            port: config.port,
            nodeResolve: true,
            logStartup: false,
            logCompileErrors: false,

            // add babel plugin for test coverage
            babelConfig: config.coverage
              ? {
                  plugins: [
                    [require.resolve('babel-plugin-istanbul'), { exclude: coverageExclude }],
                  ],
                }
              : undefined,

            // only transform test coverage file if user did not also add a babel plugin
            // this improves speed a lot
            customBabelInclude: !hasCustomBabelConfig ? coverageInclude : undefined,
            customBabelExclude: !hasCustomBabelConfig ? coverageExclude : undefined,

            middlewares: [
              async function middleware(ctx: Context, next: Next) {
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
                      ...session,
                      testFile: createBrowserFilePath(rootDir, session.testFile),
                      watch: !!config.watch,
                    } as any);
                    return;
                  }

                  // TODO: Handle race conditions for these requests
                  if (command === 'session-started') {
                    ctx.status = 200;
                    sessions.updateStatus(session, SESSION_STATUS.STARTED);
                    return;
                  }

                  if (command === 'session-finished') {
                    ctx.status = 200;
                    const result = (await parse.json(ctx)) as any;
                    sessions.updateStatus(
                      {
                        ...session,
                        ...result,
                      },
                      SESSION_STATUS.FINISHED,
                    );
                    return;
                  }
                }

                return next();
              },

              dependencyGraphMiddleware({
                rootDir,
                fileWatcher,
                onRequest404,
                onRerunSessions,
              }),
            ],
            plugins: [
              {
                serve(context: Context) {
                  if (context.path === '/') {
                    return {
                      type: 'html',
                      body: config.testRunnerHtml
                        ? config.testRunnerHtml(config)
                        : createTestPage(context, config.testFrameworkImport),
                    };
                  }
                },
              },
            ],
          },
          devServerConfig,
        ),
      );

      ({ server } = await startServer(serverConfig, fileWatcher));
    },

    async stop() {
      await server?.close();
    },
  };
}
