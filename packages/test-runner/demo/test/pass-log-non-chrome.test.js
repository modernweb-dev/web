import { expect } from './chai.js';

it('test 1', () => {
  if (
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    navigator.userAgent.toLowerCase().includes('firefox')
  ) {
    expect(true).to.be.false;
  }
  expect(true).to.be.true;
});
