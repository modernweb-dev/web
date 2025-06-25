import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

it('readonly actual', function() {
  const fixture = Object.freeze({x: {}});
  expect(fixture).to.equal(null);
})

it('symbol actual', function() {
  const fixture = Symbol('foo');
  expect(fixture).to.equal(null);
})

it('globalThis actual', function() {
  const fixture = globalThis;
  expect(fixture).to.equal(null);
})

it('HTMLElement actual', function() {
  const fixture = document.createElement('div');
  expect(fixture).to.equal(null);
})
