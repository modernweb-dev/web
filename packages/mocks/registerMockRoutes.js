import { rest } from 'msw';

const SUPPORTED_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

/**
 * Mock the given mocked routes using a Service Worker.
 *
 * @param  {import('msw/node').SetupServer | import('msw/browser').SetupWorker} system The Service Worker or Server Instance
 * @param  {boolean} bypassServiceWorker
 * @param  {import('./types.js').Mock[]} mocks
 */
export function _registerMockRoutes(system, bypassServiceWorker = false, ...mocks) {
  system.resetHandlers();

  const handlers = [];
  for (const { method, endpoint, handler } of mocks.flat(Infinity)) {
    if (!SUPPORTED_METHODS.includes(method.toLowerCase())) {
      throw new Error(`Unsupported method ${method}`);
    }

    handlers.push(
      // @ts-ignore
      rest[method](endpoint, async ({ cookies, params, request }) => {
        // @ts-ignore
        const response = await handler({ request, cookies, params });
        return response;
      }),
    );
  }

  if (!bypassServiceWorker) {
    system.use(...handlers);
  }
}
