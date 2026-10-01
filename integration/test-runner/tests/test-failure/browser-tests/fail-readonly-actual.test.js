import { expect } from '../../../../../node_modules/chai/index.js';

it('readonly actual', function () {
  const fixture = Object.freeze({ x: {} });
  expect(fixture).to.equal(null);
});
