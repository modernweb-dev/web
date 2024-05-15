import './polyfills.js';
import { swPath } from '#sw-path';
import { setupWorker } from 'msw/browser';
import { _registerMockRoutes } from './registerMockRoutes.js';

const bypassServiceWorker = new URL(window.location.href).searchParams.has('bypass-sw');
const worker = setupWorker();
const workerPromise = worker
  .start({
    serviceWorker: {
      url: swPath,
    },
    quiet: true,
    // See https://github.com/mswjs/msw/discussions/1231#discussioncomment-2729999 if you'd like to warn if there's a unhandled request
    onUnhandledRequest() {
      return undefined;
    },
  })
  .catch(() => {
    console.error(`[MOCKS]: Failed to load Service Worker.
  
Did you forget to use the mockPlugin in the dev server?`);
    return Promise.resolve();
  });

/**
 * It's unfortunate to override native `fetch`, and you should never do it, and please don't take this
 * code as an example. We have to do this here because MSW removed this behavior which was released as
 * a breaking change in a minor version https://github.com/mswjs/msw/issues/1981
 */
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  await workerPromise;
  window.fetch = originalFetch;
  return window.fetch(...args);
};

/**
 * Mock the given mocked routes using a Service Worker.
 *
 * @param  {import('./types.js').Mock[]} mocks
 */
function registerMockRoutes(...mocks) {
  _registerMockRoutes(worker, bypassServiceWorker, ...mocks);
}

export { worker, registerMockRoutes };
