/* eslint-env browser, es2020 */
/** @typedef {import('../dist/index').TestResultError} TestResultError */
/** @typedef {import('../dist/index').TestResult} TestResult */
/** @typedef {import('../dist/index').TestSuiteResult} TestSuiteResult */

// mocking libraries might overwrite window.fetch, by grabbing a reference here
// we make sure we are using the original fetch instead of the mocked variant
const fetch = window.fetch;
const PARAM_SESSION_ID = 'wtr-session-id';
const PARAM_DEBUG = 'wtr-debug';
let finished = false;

const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);
const debug = new URL(window.location.href).searchParams.get(PARAM_DEBUG) === 'true';
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
    const response = await fetch(`/wtr/${sessionId}/config?debug=${debug}`);
    return {
      ...(await response.json()),
      debug,
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
    errors: [error],
  });
}

export async function sessionStarted() {
  await fetch(`/wtr/${sessionId}/session-started?debug=${debug}`, { method: 'POST' });
}

export async function sessionFinished(result) {
  if (finished) {
    return;
  }
  finished = true;

  const sessionResult = {
    logs,
    testCoverage: window.__coverage__,
    errors: [],
    ...result,
  };
  await postJSON(`/wtr/${sessionId}/session-finished?debug=${debug}`, sessionResult);
}
