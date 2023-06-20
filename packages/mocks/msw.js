import { rest } from 'msw';
import { setupWorker } from 'msw/browser';

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

const SUPPORTED_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options'];

/**
 * @typedef {Object} Mock
 * @property {string} method
 * @property {string} endpoint
 * @property {({request}: {request: Request}) => Response | Promise<Response>} handler
 */

/**
Mock the given mocked routes using a Service Worker.

 * @param  {Array<Array<Mock>|Mock>} mocks 
 */
function registerMockRoutes(...mocks) {
  worker.resetHandlers();

  const handlers = [];
  for (const { method, endpoint, handler } of mocks.flat(Infinity)) {
    if (!SUPPORTED_METHODS.includes(method.toLowerCase())) {
      throw new Error(`Unsupported method ${method}`);
    }

    handlers.push(
      rest[method](endpoint, async ({ cookies, params, request }) => {
        const response = await handler({ request, cookies, params });

        return response;
      }),
    );
  }

  worker.use(...handlers);
}

export { worker, registerMockRoutes };
