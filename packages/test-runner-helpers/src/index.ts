// mocking libraries might overwrite window.fetch, by grabbing a reference here
// we make sure we are using the original fetch instead of the mocked variant
const fetch = window.fetch;
const PARAM_SESSION_ID = 'wtr-session-id';

const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);

function postJSON(url: string, body: unknown) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export interface Viewport {
  width: number;
  height: number;
}

export async function setViewport(viewport: Viewport): Promise<void> {
  if (!viewport) throw new Error('You must provide a viewport');
  if (typeof viewport !== 'object') throw new Error('Viewport must be an object');
  if (typeof viewport?.height == null) throw new Error('You must provide a viewport width');
  if (typeof viewport?.width == null) throw new Error('You must provide a viewport width');
  if (typeof viewport?.height !== 'number') throw new Error('Viewport height must be a number');
  if (typeof viewport?.height !== 'number') throw new Error('Viewport width must be a number');
  await postJSON(`/wtr/${sessionId}/viewport`, viewport);
}
