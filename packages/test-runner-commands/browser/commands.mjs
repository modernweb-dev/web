/* eslint-env browser, es2020 */

// mocking libraries might overwrite window.fetch, by grabbing a reference here
// we make sure we are using the original fetch instead of the mocked variant
const fetch = window.fetch;
const PARAM_SESSION_ID = 'wtr-session-id';

const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);

export async function executeServerCommand(command, payload) {
  if (typeof sessionId !== 'string') {
    throw new Error(
      'Unable to execute server commands in a browser not controlled by the test runner. ' +
        'Use the debug option from the watch menu to debug in a controlled browser.',
    );
  }

  const body = JSON.stringify({ payload });
  const response = await fetch(`/wtr/${sessionId}/command/${encodeURIComponent(command)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }).catch(() => {
    // swallow error, it is handled below
  });

  if (response.status === 404) {
    throw new Error(`Unknown command ${command}. Did you install a plugin to handle this command?`);
  }

  if (response.status !== 200) {
    throw new Error(
      `Error while executing command ${command}${payload ? ` with payload ${body}` : ''}`,
    );
  }

  return response.json();
}

export function setViewport(viewport) {
  return executeServerCommand('set-viewport', viewport);
}

export function emulateMedia(media) {
  return executeServerCommand('emulate-media', media);
}

export function setUserAgent(options) {
  return executeServerCommand('set-user-agent', options);
}
