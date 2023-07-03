const VERSION = Symbol.for('msw-integration-layer::version');

/**
 * This wrapper was made to be forward/backward compatible with potential future versions
 * of the underlying mocking library. It's api should not change, it should not have dependencies,
 * and it's import should be pure and non-sideeffectful.
 */
export const http = {
  get: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'get', endpoint, handler };
  },
  post: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'post', endpoint, handler };
  },
  put: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'put', endpoint, handler };
  },
  patch: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'patch', endpoint, handler };
  },
  delete: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'delete', endpoint, handler };
  },
  options: (endpoint, handler) => {
    return { [VERSION]: '1.x.x', method: 'options', endpoint, handler };
  },
};
