/* eslint-env browser, es2020 */
/** @typedef {import('../dist/index').TestResultError} TestResultError */
/** @typedef {import('../dist/index').TestResult} TestResult */
/** @typedef {import('../dist/index').TestSuiteResult} TestSuiteResult */

// mocking libraries might overwrite window.fetch, by grabbing a reference here
// we make sure we are using the original fetch instead of the mocked variant
const fetch = window.fetch;
const PARAM_SESSION_ID = 'wtr-session-id';
const PARAM_IMPORT_MAP = 'wds-import-map';
let finished = false;

const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);
if (typeof sessionId !== 'string') {
  throw new Error(`Could not find any session id query parameter.`);
}

function postJSON(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const logs = [];

export async function getConfig() {
  try {
    const response = await fetch(`/wtr/${sessionId}/config`);
    const config = await response.json();
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
      message: 'Failed to fetch session config',
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
  await fetch(`/wtr/${sessionId}/session-started`, { method: 'POST' });
}

export async function sessionFinished(result) {
  if (finished) {
    return;
  }
  finished = true;

  const sessionResult = {
    logs,
    errors: [],
    ...result,
  };
  await postJSON(`/wtr/${sessionId}/session-finished`, sessionResult);
}
