import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

it('readonly actual', function() {
  const fixture = Object.freeze({x: {}});
  expect(fixture).to.equal(null);
})
