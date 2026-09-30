import { expect } from '../../../../../node_modules/chai/index.js';

import { fail } from './simple-source.js';

describe('real numbers forming a monoid', function () {
  it('under addition', function () {
    expect(1 + 1).to.equal(2);
  });
});

describe('off-by-one boolean logic errors', function () {
  it('null hypothesis', function () {
    expect(true).to.be.true;
  });

  it('asserts error', function () {
    expect(false).to.be.true;
  });

  it.skip('tbd: confirm true positive', function () {
    expect(false).to.be.false;
  });
});

describe('logging during a test', function () {
  it('reports logs to JUnit', function () {
    const actual = '🤷‍♂️';
    console.log('actual is ', actual);
    expect(typeof actual).to.equal('string');
  });

  it('fails with source trace', function () {
    expect(fail()).to.equal('string');
  });
});
