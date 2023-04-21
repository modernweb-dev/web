import { expect } from '@esm-bundle/chai';
import { foo } from '../src/foo.js';

it('works', () => {
  foo();
  expect(true).to.be.true;
});
