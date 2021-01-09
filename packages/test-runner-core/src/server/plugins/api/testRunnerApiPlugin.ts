import { Context, getRequestFilePath, ServerStartParams, WebSocket } from '@web/dev-server-core';

import { TestRunnerCoreConfig } from '../../../config/TestRunnerCoreConfig';
import { TestSessionManager } from '../../../test-session/TestSessionManager';
import { PARAM_SESSION_ID } from '../../../utils/constants';
import { TestRunnerPlugin } from '../../TestRunnerPlugin';
import { SESSION_STATUS } from '../../../test-session/TestSessionStatus';
import { TestSession } from '../../../test-session/TestSession';
import { parseBrowserResult } from './parseBrowserResult';
import { TestRunner } from '../../../runner/TestRunner';
import { createSourceMapFunction, SourceMapFunction } from './createSourceMapFunction';
import { MapBrowserUrl } from '@web/browser-logs/src/parseStackTrace';

interface SessionMessage extends Record<string, unknown> {
  sessionId: string;
  testFile: string;
}

function createMapBrowserUrl(rootDir: string) {
  return function mapBrowserUrl(url: URL) {
    if (url.pathname.startsWith('/__web-test-runner__/test-framework')) {
      return url.pathname.substring('/__web-test-runner__/test-framework'.length);
    }
    return getRequestFilePath(url.href, rootDir);
  };
}

class TestRunnerApiPlugin implements TestRunnerPlugin {
  public name = 'test-runner-api';
  public injectWebSocket = true;

  private config: TestRunnerCoreConfig;
  private plugins: TestRunnerPlugin[];
  private testRunner: TestRunner;
  private sessions: TestSessionManager;
  private sourceMapFunction: SourceMapFunction;
  private mapBrowserUrl: MapBrowserUrl;
  /** key: session id, value: browser url */
  private testSessionUrls = new Map<string, string>();

  constructor(
    config: TestRunnerCoreConfig,
    testRunner: TestRunner,
    sessions: TestSessionManager,
    plugins: TestRunnerPlugin[],
  ) {
    this.config = config;
    this.testRunner = testRunner;
    this.sessions = sessions;
    this.plugins = plugins;
    this.mapBrowserUrl = createMapBrowserUrl(config.rootDir);
    this.sourceMapFunction = createSourceMapFunction(
      this.config.protocol,
      this.config.hostname,
      this.config.port,
    );

    this.testRunner.on('test-run-started', ({ testRun }) => {
      if (testRun !== 0) {
        // create a new source map function to clear the cached source maps
        this.sourceMapFunction = createSourceMapFunction(
          this.config.protocol,
          this.config.hostname,
          this.config.port,
        );
      }
    });
  }

  getSession(sessionId: string) {
    const session = this.sessions.get(sessionId) || this.sessions.getDebug(sessionId);
    if (!session) {
      throw new Error(`Session id ${sessionId} not found`);
    }
    return session;
  }

  parseSessionMessage(data: Record<string, unknown>) {
    if (typeof data.sessionId === 'string') {
      return { message: (data as any) as SessionMessage, session: this.getSession(data.sessionId) };
    }
    throw new Error('Missing sessionId in browser websocket message.');
  }

  async transform(context: Context) {
    if (context.response.is('html')) {
      const sessionId = context.URL.searchParams.get(PARAM_SESSION_ID);
      if (!sessionId) {
        return;
      }

      try {
        this.testSessionUrls.set(
          sessionId,
          `${this.config.protocol}//${this.config.hostname}:${this.config.port}${context.url}`,
        );
      } catch (error) {
        this.config.logger.error('Error while creating test file import path');
        this.config.logger.error(error);
        context.status = 500;
      }
    }
  }

  serverStart({ webSockets }: ServerStartParams) {
    webSockets!.on('message', async ({ webSocket, data }) => {
      if (data.type === 'wtr-session-started') {
        this._onSessionStarted(webSocket, data);
        return;
      }

      if (data.type === 'wtr-session-finished') {
        this._onSessionFinished(data);
        return;
      }

      if (data.type === 'wtr-command') {
        this._onCommand(webSocket, data);
        return;
      }
    });
  }

  private _onSessionStarted(webSocket: WebSocket, data: Record<string, unknown>) {
    if (!data.testFile) {
      // this is a regular test session
      const { session } = this.parseSessionMessage(data);
      if (!session.debug) {
        if (session.status !== SESSION_STATUS.INITIALIZING) {
          this._onMultiInitialized(session);
          return;
        }
        // mark the session as started
        this.sessions.updateStatus(session, SESSION_STATUS.TEST_STARTED);
        this._waitForDisconnect(webSocket, session.id);
      }
    }
  }

  private async _onSessionFinished(data: Record<string, unknown>) {
    const { session, message } = this.parseSessionMessage(data);
    if (session.debug) return;
    if (typeof message.result !== 'object') {
      throw new Error('Missing result in session-finished message.');
    }
    if (!data.userAgent || typeof data.userAgent !== 'string') {
      throw new Error('Missing userAgent in session-finished message.');
    }

    const result = await parseBrowserResult(
      this.config,
      this.mapBrowserUrl,
      this.sourceMapFunction,
      data.userAgent,
      message.result as Partial<TestSession>,
    );

    this.sessions.updateStatus({ ...session, ...result }, SESSION_STATUS.TEST_FINISHED);
  }

  private async _onCommand(webSocket: WebSocket, data: Record<string, unknown>) {
    const { session, message } = this.parseSessionMessage(data);
    const { id, command, payload } = message;

    if (typeof id !== 'number') throw new Error('Missing message id.');
    if (typeof command !== 'string') throw new Error('A command name must be provided.');

    for (const plugin of this.plugins) {
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
        this.config.logger.error(error);
        webSocket.send(JSON.stringify({ type: 'message-response', id, error: error.message }));
        return;
      }
    }

    // no command was matched
    webSocket.send(JSON.stringify({ type: 'message-response', id, response: { executed: false } }));
  }

  /**
   * Waits for web socket to become disconnected, and checks after disconnect if it was expected
   * or if some error occurred.
   */
  private _waitForDisconnect(webSocket: WebSocket, sessionId: string) {
    webSocket.on('close', async () => {
      const session = this.sessions.get(sessionId);
      if (session?.status !== SESSION_STATUS.TEST_STARTED) {
        // websocket closed after finishing the tests, this is expected
        return;
      }

      // the websocket disconnected while the tests were still running, this can happen for many reasons.
      // we wait 2000ms (magic number) to let other handlers come up with a more specific error message
      await new Promise(r => setTimeout(r, 2000));
      const updatedSession = this.sessions.get(sessionId);
      if (updatedSession?.status !== SESSION_STATUS.TEST_STARTED) {
        // something else handled the disconnect
        return;
      }

      const startUrl = this.testSessionUrls.get(updatedSession.id);
      const currentUrl = await updatedSession.browser.getBrowserUrl(updatedSession.id);

      if (!currentUrl || startUrl !== currentUrl) {
        this._setSessionFailed(
          updatedSession,
          `Tests were interrupted because the page navigated to ${
            currentUrl ? currentUrl : 'another origin'
          }. ` +
            'This can happen when clicking a link, submitting a form or interacting with window.location.',
        );
      } else {
        this._setSessionFailed(
          updatedSession,
          'Tests were interrupted because the browser disconnected.',
        );
      }
    });
  }

  private _onMultiInitialized(session: TestSession) {
    this._setSessionFailed(
      session,
      'Tests were interrupted because the page was reloaded. ' +
        'This can happen when clicking a link, submitting a form or interacting with window.location.',
    );
  }

  private _setSessionFailed(session: TestSession, message: string) {
    this.sessions.updateStatus(
      {
        ...session,
        errors: [...(session.errors ?? []), { message }],
      },
      SESSION_STATUS.TEST_FINISHED,
    );
  }
}

export function testRunnerApiPlugin(
  config: TestRunnerCoreConfig,
  testRunner: TestRunner,
  sessions: TestSessionManager,
  plugins: TestRunnerPlugin[],
) {
  return new TestRunnerApiPlugin(config, testRunner, sessions, plugins);
}
