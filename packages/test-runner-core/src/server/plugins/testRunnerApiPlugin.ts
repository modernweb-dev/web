import { deserialize } from '@web/browser-logs';
import { TestRunnerCoreConfig } from '../../config/TestRunnerCoreConfig';
import { TestSessionManager } from '../../test-session/TestSessionManager';
import { PARAM_SESSION_ID } from '../../utils/constants';
import { TestRunnerPlugin } from '../TestRunnerPlugin';
import { createTestFileImportPath } from '../utils';
import { SESSION_STATUS } from '../../test-session/TestSessionStatus';

interface SessionMessage extends Record<string, unknown> {
  sessionId: string;
  testFile: string;
}

export function testRunnerApiPlugin(
  config: TestRunnerCoreConfig,
  plugins: TestRunnerPlugin[],
  sessions: TestSessionManager,
): TestRunnerPlugin {
  const testFileUrls = new Map<string, string>();

  function getSession(sessionId: string) {
    const session = sessions.get(sessionId) || sessions.getDebug(sessionId);
    if (!session) {
      throw new Error(`Session id ${sessionId} not found`);
    }
    return session;
  }

  function parseSessionMessage(data: Record<string, unknown>) {
    if (typeof data.sessionId === 'string') {
      return { message: (data as any) as SessionMessage, session: getSession(data.sessionId) };
    }
    throw new Error('Missing sessionId in browser websocket message.');
  }

  return {
    name: 'test-plugin',

    injectWebSocket: true,

    async transform(context) {
      if (context.response.is('html')) {
        const sessionId = context.URL.searchParams.get(PARAM_SESSION_ID);
        if (!sessionId) {
          return;
        }

        try {
          const session = getSession(sessionId);
          if (!session.debug) {
            // store the session user agent, used for source maps
            sessions.update({
              ...session,
              userAgent: context.headers['user-agent'],
            });
          }

          const testFileUrl = await createTestFileImportPath(
            config,
            context,
            session.testFile,
            sessionId,
          );
          testFileUrls.set(sessionId, testFileUrl);
        } catch (error) {
          config.logger.error('Error while creating test file import path');
          config.logger.error(error);
          context.status = 500;
        }
      }
    },

    serverStart({ webSockets }) {
      webSockets!.on('message', async ({ webSocket, data }) => {
        if (data.type === 'wtr-session-started') {
          let runtimeConfig: Record<string, unknown>;

          if (data.testFile) {
            // config for manually debugging a test file
            runtimeConfig = {
              testFile: data.testFile as string,
              watch: !!config.watch,
              debug: true,
              testFrameworkConfig: config.testFramework?.config,
            };
          } else {
            const { session } = parseSessionMessage(data);
            if (!session.debug) {
              // mark the session as started
              sessions.updateStatus(session, SESSION_STATUS.TEST_STARTED);
            }

            const testFile = testFileUrls.get(session.id);

            if (!testFile) {
              throw new Error(`Missing test file url for session ${session.id}`);
            }

            // config for regular test session
            runtimeConfig = {
              testFile,
              watch: !!config.watch,
              debug: session.debug,
              testFrameworkConfig: config.testFramework?.config,
            };
          }

          // send config to the broser to kick off testing
          webSocket.send(JSON.stringify({ type: 'wtr-config', config: runtimeConfig }));
          return;
        }

        if (data.type === 'wtr-session-finished') {
          const { session, message } = parseSessionMessage(data);
          if (session.debug) return;

          if (typeof message.result !== 'object') {
            throw new Error('Missing result in session-finished message.');
          }

          const result = message.result as any;
          if (result.logs) {
            result.logs = result.logs
              .map((log: any) => ({
                type: log.type,
                args: log.args.map((a: any) => deserialize(a)),
              }))
              .filter((log: any) =>
                config.filterBrowserLogs ? config.filterBrowserLogs(log) : true,
              )
              .map((log: any) => log.args);
          }
          sessions.updateStatus({ ...session, ...result }, SESSION_STATUS.TEST_FINISHED);
          return;
        }

        if (data.type === 'wtr-command') {
          const { session, message } = parseSessionMessage(data);
          const { id, command, payload } = message;

          if (typeof id !== 'number') {
            throw new Error('Missing message id.');
          }
          if (typeof command !== 'string') {
            throw new Error('A command name must be provided.');
          }

          for (const plugin of plugins) {
            try {
              const result = await plugin.executeCommand?.({ command, payload, session });
              if (result != null) {
                webSocket.send(
                  JSON.stringify({
                    type: 'message-response',
                    id,
                    response: { executed: true, result },
                  }),
                );
                return;
              }
            } catch (error) {
              config.logger.error(error);
              webSocket.send(
                JSON.stringify({ type: 'message-response', id, error: error.message }),
              );
              return;
            }
          }

          webSocket.send(
            JSON.stringify({ type: 'message-response', id, response: { executed: false } }),
          );
        }
      });
    },
  };
}
