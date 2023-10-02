const VERSION = Symbol.for('msw-integration-layer::version');

/**
 * @typedef {(context: {
 *  request: Request,
 *  cookies: Record<string, unknown>,
 *  params: Record<string, unknown>
 * }) => Response | Promise<Response>} handler
 */

/**
 * @typedef {{
 *  method: string,
 *  endpoint: string,
 *  handler: handler,
 *  [VERSION]: string
 * }} Mock
 */

/**
 * This wrapper was made to be forward/backward compatible with potential future versions
 * of the underlying mocking library. It's api should not change, it should not have dependencies,
 * and it's import should be pure and non-sideeffectful.
 */
export const http = {
  /**
   * @param {string} endpoint
   * @param {handler} handler
   * @returns {Mock}
   */
  get: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'get', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {handler} handler
   * @returns {Mock}
   */
  post: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'post', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {handler} handler
   * @returns {Mock}
   */
  put: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'put', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {handler} handler
   * @returns {Mock}
   */
  patch: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'patch', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {handler} handler
   * @returns {Mock}
   */
  delete: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'delete', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {handler} handler
   * @returns {Mock}
   */
  options: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'options', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {handler} handler
   * @returns {Mock}
   */
  head: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'head', endpoint, handler };
  },
};
