import './fail-syntax-error-dependency.js';

describe('test 404 import', () => {
  it('is never registered because ./x.js does not exist', () => {});
});
