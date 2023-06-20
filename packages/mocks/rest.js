const VERSION = Symbol.for('msw-integration-layer::version');

export const rest = {
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
