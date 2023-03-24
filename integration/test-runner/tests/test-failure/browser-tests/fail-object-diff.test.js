import { expect } from '../../../../../node_modules/chai/chai.js';
import './shared-a.js';

it('object diff A', () => {
  expect({ a: '1', b: '2', c: '3' }).to.equal({ a: '1', b: '4', c: '3' });
});

it('object diff B', () => {
  expect({ a: '1', b: '2', c: '3' }).to.equal('lol');
});

it('object diff C', () => {
  expect({ a: '1', b: '2', c: '3' }).to.equal({ a: '1', b: '5', c: '3', c: 'ewrwekropw' });
});
