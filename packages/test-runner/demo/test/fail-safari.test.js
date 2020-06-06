import { expect } from './chai.js';

it('only fails on safari', () => {
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    expect(true).to.be.false;
  }
});
