import { expect } from './chai.js';

beforeEach(() => {
  throw new Error('error thrown in afterEach hook');
});

it('true is true', () => {
  expect(true).to.equal(true);
});

it('true is really true', () => {
  expect(true).to.equal(true);
});
