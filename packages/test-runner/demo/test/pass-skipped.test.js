import { expect } from './chai.js';
import './shared-a.js';

it('test 1', () => {
  expect(true).to.be.true;
});

it.skip('this test is skipped', () => {
  expect('foo').to.be.a('string');
});
