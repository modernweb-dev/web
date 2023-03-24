import { expect } from '../../../../../node_modules/chai/chai.js';

it('supports object spread', () => {
  const foo = { a: 1 };
  const bar = { b: 2, ...foo };
  expect(bar).to.eql({ a: 1, b: 2 });
});

it('supports async functions', () => {
  async function asyncFunction() {
    //
  }
  expect(asyncFunction() instanceof Promise).to.equal(true);
});

it('supports exponentiation', () => {
  expect(2 ** 4).to.equal(16);
});

it('supports classes', () => {
  class Foo {
    constructor(foo) {
      this.foo = foo;
    }
  }

  class Bar extends Foo {
    constructor() {
      super('bar');
    }
  }
  expect(new Bar().foo).to.equal('bar');
});

it('supports template literals', () => {
  const val = 'literal';
  expect(`template ${val}`).to.equal('template literal');
});

it('supports optional chaining', () => {
  const lorem = { ipsum: 'lorem ipsum' };
  expect(lorem?.ipsum).to.equal('lorem ipsum');
  expect(lorem?.ipsum?.foo).to.equal(undefined);
});

it('supports nullish coalescing', () => {
  const buz = null;
  expect(buz ?? 'nullish colaesced').to.equal('nullish colaesced');
});
