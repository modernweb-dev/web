import { a, b } from './dist/index.js';

describe('fail source maps bundled', () => {
  it('fails one', () => {
    a();
  });

  it('fails two', () => {
    b();
  });
});
