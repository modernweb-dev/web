import { http } from 'msw/core/http';

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

  for (let { method, endpoint, handler } of mocks.flat(Infinity)) {
    if (!SUPPORTED_METHODS.includes(method.toLowerCase())) {
      throw new Error(`Unsupported method ${method}`);
    }

    if (!handler) {
      throw new Error(`Missing handler for method: "${method}", endpoint: "${endpoint}".
This likely means there is something wrong with how you're using \`http.get(endpoint, handler)\`. Make sure the \`handler\` exists and is a function.`);
    }

    /**
     * If the `endpoint` starts with a "/", we append a "*" in front of it because
     * some api calls may have an optional prefix, for example: "https://api.localhost:8000/api/foo"
     *
     * Adding the "*" will match api calls made with a prefix, and api calls made without a prefix,
     * without the need to overwrite the native fetch function.
     */
    if (endpoint.startsWith('/')) {
      endpoint = '*' + endpoint;
    }

    handlers.push(
      // @ts-ignore
      http[method](endpoint, async ({ cookies, params, request }) => {
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
