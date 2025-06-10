import { setupServer } from 'msw/node';
import { _registerMockRoutes } from './registerMockRoutes.js';

export const server = setupServer();
server.listen();

/**
 * Mock the given mocked routes using a Service Worker.
 *
 * @param  {import('./types.js').Mock[]} mocks
 */
export function registerMockRoutes(...mocks) {
  _registerMockRoutes(server, false, ...mocks);
}
