import {
  TestResultError,
  RuntimeConfig,
  FrameworkTestSessionResult,
  BrowserTestSessionResult,
  TestResult,
  TestSuiteResult,
} from './types';

// mocking libraries might overwrite window.fetch, by grabbing a reference here
// we make sure we are using the original fetch instead of the mocked variant
const fetch = window.fetch;
const PARAM_SESSION_ID = 'wtr-session-id';
const PARAM_DEBUG = 'wtr-debug';
let finished = false;

const pendingLogs: Set<Promise<any>> = new Set();

const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);
const debug = new URL(window.location.href).searchParams.get(PARAM_DEBUG) === 'true';
if (typeof sessionId !== 'string') {
  throw new Error(`Could not find any session id query parameter.`);
}

function postJSON(url: string, body: unknown) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const logs: string[] = [];

export async function getConfig(): Promise<RuntimeConfig & { debug: boolean }> {
  try {
    const response = await fetch(`/wtr/${sessionId}/config?debug=${debug}`);
    return {
      ...(await response.json()),
      debug,
    };
  } catch (err) {
    await sessionFailed({ message: 'Failed to fetch session config', stack: err?.stack });
    throw err;
  }
}

export function sessionFailed(error: TestResultError) {
  return sessionFinished({
    passed: false,
    errors: [error],
  });
}

export async function sessionStarted() {
  await fetch(`/wtr/${sessionId}/session-started?debug=${debug}`, { method: 'POST' });
}

export async function sessionFinished(result: FrameworkTestSessionResult): Promise<void> {
  if (finished) return;
  finished = true;

  const sessionResult: BrowserTestSessionResult = {
    logs,
    testCoverage: (window as any).__coverage__,
    errors: [],
    ...result,
  };
  await Promise.all(Array.from(pendingLogs)).catch(error => {
    console.error(error);
  });
  await postJSON(`/wtr/${sessionId}/session-finished?debug=${debug}`, sessionResult);
}

export {
  TestResultError,
  RuntimeConfig,
  FrameworkTestSessionResult,
  BrowserTestSessionResult,
  TestResult,
  TestSuiteResult,
};
