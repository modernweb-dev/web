import {
  TestResultError,
  RuntimeConfig,
  FrameworkTestSessionResult,
  BrowserTestSessionResult,
  FailedImport,
  TestResult,
} from './types';

const PARAM_SESSION_ID = 'wtr-session-id';
const PARAM_DEBUG = 'wtr-debug';

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

function stringify(obj: unknown) {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    // some objects can't be stringified, such as circular objects
    return obj;
  }
}

export function captureConsoleOutput() {
  for (const level of ['log', 'error', 'debug', 'warn'] as (keyof Console)[]) {
    const original: (...args: any[]) => any = console[level];
    console[level] = (...args: any[]) => {
      logs.push(args.map(a => (typeof a === 'object' ? stringify(a) : a)).join(' '));
      original.apply(console, args);
    };
  }
}

export function logUncaughtErrors() {
  window.addEventListener('error', e => {
    console.error(`Uncaught error: ${e?.error?.stack ?? e?.error}`);
  });

  window.addEventListener('unhandledrejection', e => {
    e.promise.catch(error => {
      console.error(`Unhandled rejection: ${error?.stack ?? error}`);
    });
  });
}

export async function getConfig(): Promise<RuntimeConfig & { debug: boolean }> {
  try {
    const response = await fetch(`/wtr/${sessionId}/config`);
    return {
      ...(await response.json()),
      debug,
    };
  } catch (err) {
    await sessionError({ message: 'Failed to fetch session config', stack: err?.stack });
    throw err;
  }
}

export function sessionError(error: TestResultError) {
  return sessionFinished({
    passed: false,
    error,
    failedImports: [],
    tests: [],
  });
}

export async function sessionStarted() {
  await fetch(`/wtr/${sessionId}/session-started`, { method: 'POST' });
}

export async function sessionFinished(result: FrameworkTestSessionResult): Promise<void> {
  const sessionResult: BrowserTestSessionResult = {
    logs,
    testCoverage: (window as any).__coverage__,
    ...result,
  };
  await Promise.all(Array.from(pendingLogs)).catch(error => {
    console.error(error);
  });
  await postJSON(`/wtr/${sessionId}/session-finished`, sessionResult);
}

export {
  TestResultError,
  RuntimeConfig,
  FrameworkTestSessionResult,
  BrowserTestSessionResult,
  FailedImport,
  TestResult,
};
