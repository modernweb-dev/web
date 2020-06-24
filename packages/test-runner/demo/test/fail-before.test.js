import { expect } from './chai.js';

before(() => {
  throw new Error('error thrown in before hook');
});

it('true is true', () => {
  expect(true).to.equal(true);
});

it('true is really true', () => {
  expect(true).to.equal(true);
});
