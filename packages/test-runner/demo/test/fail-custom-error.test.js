import { expect } from './chai.js';
import './shared-a.js';

it('custom error', () => {
  throw Error('Some error');
});
