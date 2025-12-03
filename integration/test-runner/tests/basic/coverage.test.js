import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

describe('basic test', () => {
  it('works', () => {
    window.__coverage__ = {
      basic: {
        path: 'basic.js',
        statementMap: {},
        fnMap: {},
        branchMap: {},
        s: {},
        f: {},
        b: {},
      },
    };
    expect(true).to.equal(true);
  });
});
