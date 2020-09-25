/* eslint-env browser, es2020 */
/** @typedef {import('../dist/index').TestResultError} TestResultError */
/** @typedef {import('../dist/index').TestResult} TestResult */
/** @typedef {import('../dist/index').TestSuiteResult} TestSuiteResult */

// mocking libraries might overwrite window.fetch, by grabbing a reference here
// we make sure we are using the original fetch instead of the mocked variant
const fetch = window.fetch;
const PARAM_SESSION_ID = 'wtr-session-id';
const PARAM_TEST_FILE = 'wtr-test-file';
const PARAM_IMPORT_MAP = 'wds-import-map';
let finished = false;

const testFile = new URL(window.location.href).searchParams.get(PARAM_TEST_FILE);
const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);
if (typeof sessionId !== 'string' && typeof testFile !== 'string') {
  throw new Error(`Could not find any session id or test filequery parameter.`);
}

function postJSON(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function getSessionConfig() {
  const response = await fetch(`/wtr/${sessionId}/config`);
  return response.json();
}

async function getTestFileConfig() {
  const response = await fetch(`/wtr/test-config`);
  const config = await response.json();
  return { ...config, testFile };
}

export async function getConfig() {
  try {
    const config = await (sessionId ? getSessionConfig() : getTestFileConfig());
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

  await fetch(`/wtr/${sessionId}/session-started`, { method: 'POST' });
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

  const sessionResult = {
    // some browser launchers set browser logs here
    logs: window.__wtr_browser_logs__ ? window.__wtr_browser_logs__.logs : [],
    errors: [],
    ...result,
  };
  await postJSON(`/wtr/${sessionId}/session-finished`, sessionResult);
}
