import './polyfills.js';

import { setupWorker } from 'msw/browser';
import { _registerMockRoutes } from './_registerMockRoutes.js';

const bypassServiceWorker = new URL(window.location.href).searchParams.has('bypass-sw');
const worker = setupWorker();
worker.start({
  serviceWorker: {
    url: '__msw_sw__.js',
  },
  quiet: true,
  // See https://github.com/mswjs/msw/discussions/1231#discussioncomment-2729999 if you'd like to warn if there's a unhandled request
  onUnhandledRequest() {
    return undefined;
  },
});

/**
 * Mock the given mocked routes using a Service Worker.
 *
 * @param  {Array<Array<Mock>|Mock>} mocks
 */
export function registerMockRoutes(...mocks) {
  _registerMockRoutes(worker, bypassServiceWorker, ...mocks);
}
