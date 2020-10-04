import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

afterEach(() => {
  throw new Error('error thrown in afterEach hook');
});

it('true is true', () => {
  expect(true).to.equal(true);
});

it('true is really true', () => {
  expect(true).to.equal(true);
});
