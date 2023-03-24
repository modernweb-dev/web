import { expect } from '../../../../../node_modules/chai/esm/chai.js';

describe('basic test', () => {
  it('works', () => {
    expect(window.__group__).to.equal('a');
  });
});
