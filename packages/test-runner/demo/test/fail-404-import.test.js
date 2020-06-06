import './non-existing.js';

describe('test 404 import', () => {
  it('is never registered because ./x.js does not exist', () => {});
});
