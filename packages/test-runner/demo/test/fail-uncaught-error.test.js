import { expect } from './chai.js';

try {
  throw new Error('Error before running tests');
} catch (error) {
  debugger;
}

it('test 1', () => {
  expect(true).to.be.true;
});
