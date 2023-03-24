import { expect } from '../../../../../node_modules/chai/index.mjs';

describe('basic test', () => {
  it('works', () => {
    expect(window.__group__).to.equal('a');
  });
});
