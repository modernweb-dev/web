const VERSION = Symbol.for('msw-integration-layer::version');

/**
 * This wrapper was made to be forward/backward compatible with potential future versions
 * of the underlying mocking library. It's api should not change, it should not have dependencies,
 * and it's import should be pure and non-sideeffectful.
 */
export const http = {
  /**
   * @param {string} endpoint
   * @param {import('./types.js').handler} handler
   * @returns {import('./types.js').Mock}
   */
  get: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'get', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {import('./types.js').handler} handler
   * @returns {import('./types.js').Mock}
   */
  post: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'post', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {import('./types.js').handler} handler
   * @returns {import('./types.js').Mock}
   */
  put: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'put', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {import('./types.js').handler} handler
   * @returns {import('./types.js').Mock}
   */
  patch: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'patch', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {import('./types.js').handler} handler
   * @returns {import('./types.js').Mock}
   */
  delete: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'delete', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {import('./types.js').handler} handler
   * @returns {import('./types.js').Mock}
   */
  options: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'options', endpoint, handler };
  },
  /**
   * @param {string} endpoint
   * @param {import('./types.js').handler} handler
   * @returns {import('./types.js').Mock}
   */
  head: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'head', endpoint, handler };
  },
};
