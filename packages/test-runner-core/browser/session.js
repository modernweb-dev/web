/* eslint-env browser, es2020 */
/** @typedef {import('../dist/index').TestResultError} TestResultError */
/** @typedef {import('../dist/index').TestResult} TestResult */
/** @typedef {import('../dist/index').TestSuiteResult} TestSuiteResult */

import { webSocket, sendMessage } from '/__web-dev-server__web-socket.js';

const PARAM_SESSION_ID = 'wtr-session-id';
const PARAM_TEST_FILE = 'wtr-test-file';
const PARAM_IMPORT_MAP = 'wds-import-map';
let finished = false;

const testFile = new URL(window.location.href).searchParams.get(PARAM_TEST_FILE);
const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);
if (typeof sessionId !== 'string' && typeof testFile !== 'string') {
  throw new Error(`Could not find any session id or test filequery parameter.`);
}

let resolveConfig;
const configPromise = new Promise(resolve => {
  resolveConfig = resolve;
});

webSocket.addEventListener('message', e => {
  try {
    const message = JSON.parse(e.data);
    if (message.type === 'wtr-config') {
      if (typeof message.config !== 'object') {
        throw new Error('Missing config property in websocket wtr-config message.');
      }
      resolveConfig(message.config);
    }
  } catch (error) {
    console.error('[Web Test Runner] Error while handling websocket message.');
    console.error(error);
  }
});

export async function getConfig() {
  try {
    const config = await configPromise;
    const url = new URL(import.meta.url);

    // pass on import map parameter to test files, this special cases a specific plugin
    // which is not ideal
    const importMapId = url.searchParams.get(PARAM_IMPORT_MAP);
    if (importMapId == null) {
      return config;
    }

    const separator = config.testFile.includes('?') ? '&' : '?';
    return {
      ...config,
      testFile: `${config.testFile}${separator}${PARAM_IMPORT_MAP}=${importMapId}`,
    };
  } catch (err) {
    await sessionFailed({
      message: 'Failed to fetch test config',
      stack: err ? err.stack : undefined,
    });
    throw err;
  }
}

export function sessionFailed(error) {
  return sessionFinished({
    passed: false,
    errors: [
      // copy references because an Error instance cannot be turned into JSON
      {
        message: error.message,
        stack: error.stack,
        expected: error.expected,
        actual: error.actual,
      },
    ],
  });
}

export async function sessionStarted() {
  if (!sessionId) {
    // don't send anything if we're debugging manually
    return;
  }

  await sendMessage({ type: 'wtr-session-started', sessionId, testFile });
}

export async function sessionFinished(result) {
  if (!sessionId) {
    // don't send anything if we're debugging manually
    return;
  }

  if (finished) {
    return;
  }
  finished = true;

  const fullResult = {
    // some browser launchers set browser logs here
    logs: window.__wtr_browser_logs__ ? window.__wtr_browser_logs__.logs : [],
    errors: [],
    ...result,
  };

  await sendMessage({ type: 'wtr-session-finished', sessionId, testFile, result: fullResult });
}
