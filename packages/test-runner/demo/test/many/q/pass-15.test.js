import { expect } from '../../chai.js';
import '../../shared-a.js';
import '../../shared-b.js';

it('test 1', () => {
  expect(true).to.be.true;
});

it('test 2', () => {
  expect('foo').to.be.a('string');
});

it('test 3', () => {
  expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
});

it('test 4', () => {
  expect(4).to.equal(4);
});

it('test 5', () => {
  expect(() => {}).to.be.a('function');
});

describe('scoped tests', () => {
  it('test 6', () => {
    expect(true).to.be.true;
  });

  it('test 7', () => {
    expect('foo').to.be.a('string');
  });

  it('test 8', () => {
    expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
  });

  it('test 9', () => {
    expect(4).to.equal(4);
  });

  it('test 10', () => {
    expect(() => {}).to.be.a('function');
  });
});
