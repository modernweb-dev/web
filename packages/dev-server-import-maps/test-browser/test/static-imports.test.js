import { expect } from 'chai';

it('it can import chai using a static import', () => {
  if (typeof expect !== 'function') {
    throw new Error('expect should be a function');
  }
});
