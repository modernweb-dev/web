import '../../../../../../node_modules/chai/chai.js';
import defaultFoo from './modules/default-export.js';
import { namedFoo, namedBar } from './modules/named-exports.js';

import { compiledEsmFoo, compiledEsmBar } from './modules/compiled-esm-named-exports.js';
import compiledEsmDefault from './modules/compiled-esm-default-exports.js';

import requiredDefault from './modules/require-default.js';
import { requiredNamedFoo, requiredNamedBar } from './modules/require-named.js';

const { expect } = window.chai;

describe('commonjs', () => {
  it('can handle default export', () => {
    expect(defaultFoo).to.equal('foo');
  });

  it('can handle named exports', () => {
    expect(namedFoo).to.equal('foo');
    expect(namedBar).to.equal('bar');
  });

  it('can handle compiled es modules with named exports', () => {
    expect(compiledEsmFoo).to.equal('foo');
    expect(compiledEsmBar).to.equal('bar');
  });

  it('can handle compiled es modules with a default export', () => {
    expect(compiledEsmDefault).to.equal('bar');
  });

  it('can handle require default', () => {
    expect(requiredDefault).to.equal('foo');
  });

  it('can handle require named', () => {
    expect(requiredNamedFoo).to.equal('foo');
    expect(requiredNamedBar).to.equal('bar');
  });
});
