import { expect } from './chai.js';

throw new Error('Error before running tests');

it('test 1', () => {
  expect(true).to.be.true;
});
