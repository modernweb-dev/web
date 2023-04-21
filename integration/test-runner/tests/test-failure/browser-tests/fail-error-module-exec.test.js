import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

throw new Error('This is thrown before running tests');

it('test 1', () => {
  expect(true).to.be.true;
});
