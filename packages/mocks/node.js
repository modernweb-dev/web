import { setupServer } from 'msw/node';
import { _registerMockRoutes } from './_registerMockRoutes.js';
export { rest } from './rest.js';

export const server = setupServer();
server.listen();

/**
 * Mock the given mocked routes using a Service Worker.
 *
 * @param  {Array<Array<Mock>|Mock>} mocks
 */
export function registerMockRoutes(...mocks) {
  _registerMockRoutes(server, false, ...mocks);
}
