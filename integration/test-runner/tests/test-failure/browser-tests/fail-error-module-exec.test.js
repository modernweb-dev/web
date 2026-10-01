import { expect } from '../../../../../node_modules/chai/index.js';

throw new Error('This is thrown before running tests');

it('test 1', () => {
  expect(true).to.be.true;
});
