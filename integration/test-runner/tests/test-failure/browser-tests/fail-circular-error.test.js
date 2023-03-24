import { expect } from '../../../../../node_modules/chai/index.mjs';

it('bad predicate', function() {
  const fixture = { x: 'x' }
  fixture.circle = fixture;
  expect(fixture).to.equal(null);
})
