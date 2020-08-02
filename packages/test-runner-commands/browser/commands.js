/* eslint-env browser, es2020 */

// mocking libraries might overwrite window.fetch, by grabbing a reference here
// we make sure we are using the original fetch instead of the mocked variant
const fetch = window.fetch;
const PARAM_SESSION_ID = 'wtr-session-id';

const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);
if (typeof sessionId !== 'string') {
  throw new Error(`Could not find any session id query parameter.`);
}

export function executeServerCommand(command, payload) {
  return fetch(`/wtr/${sessionId}/command/${encodeURIComponent(command)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload != null ? JSON.stringify(payload) : {},
  });
}

export function setViewport(viewport) {
  if (!viewport) throw new Error('You must provide a viewport');
  if (typeof viewport !== 'object') throw new Error('Viewport must be an object');
  if (viewport.height == null) throw new Error('You must provide a viewport width');
  if (viewport.width == null) throw new Error('You must provide a viewport width');
  if (typeof viewport.height !== 'number') throw new Error('Viewport height must be a number');
  if (typeof viewport.height !== 'number') throw new Error('Viewport width must be a number');
  return executeServerCommand('set-viewport', viewport);
}
