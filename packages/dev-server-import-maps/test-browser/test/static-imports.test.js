import { expect } from 'chai/chai.js';

it('it can import chai using a static import', () => {
  if (typeof expect !== 'function') {
    throw new Error('expect should be a function');
  }
});
