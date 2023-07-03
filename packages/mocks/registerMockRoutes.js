import { rest } from 'msw';

/**
 * @typedef {Object} Mock
 * @property {string} method
 * @property {string} endpoint
 * @property {({request}: {request: Request}) => Response | Promise<Response>} handler
 */

const SUPPORTED_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options'];

/**
 * Mock the given mocked routes using a Service Worker.
 *
 * @param  {Object} system The Service Worker or Server Instance
 * @param  {boolean} bypassServiceWorker
 * @param  {Array<Array<Mock>|Mock>} mocks
 */
export function _registerMockRoutes(system, bypassServiceWorker = false, ...mocks) {
  system.resetHandlers();

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

  if (!bypassServiceWorker) {
    system.use(...handlers);
  }
}
