import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

describe('basic test', () => {
  it('works', () => {
    window.__coverage__ = 'something';
    expect(true).to.equal(true);
  });
});
