import 'chai/chai.js';

it('it can import chai using a static import', () => {
  if (typeof window.chai.expect !== 'function') {
    throw new Error('expect should be a function');
  }
});
