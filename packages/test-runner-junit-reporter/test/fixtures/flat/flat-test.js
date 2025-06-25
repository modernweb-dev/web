import '../../../../../node_modules/chai/chai.js';

it('under addition', function () {
  chai.expect(1 + 1).to.equal(2);
});

it('null hypothesis', function () {
  chai.expect(true).to.be.true;
});

it('asserts error', function () {
  chai.expect(false).to.be.true;
});

it.skip('tbd: confirm true positive', function () {
  chai.expect(false).to.be.false;
});

it('reports logs to JUnit', function () {
  const actual = '🤷‍♂️';
  console.log('actual is ', actual);
  chai.expect(typeof actual).to.equal('string');
});
