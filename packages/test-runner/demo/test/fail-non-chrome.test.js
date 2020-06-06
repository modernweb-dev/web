import { expect } from './chai.js';

it('fails on non-chrome browsers', () => {
  if (
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    navigator.userAgent.toLowerCase().includes('firefox')
  ) {
    throw new Error('This should fail on non-chrome');
  }
});
