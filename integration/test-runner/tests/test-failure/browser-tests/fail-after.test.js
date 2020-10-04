import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

after(() => {
  throw new Error('error thrown in after hook');
});

it('true is true', () => {
  expect(true).to.equal(true);
});

it('true is really true', () => {
  expect(true).to.equal(true);
});
