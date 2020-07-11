import chai from 'chai/chai.js';
import defaultFoo from '../src/default-export.js';
import { namedFoo, namedBar } from '../src/named-exports.js';

// TODO: Ideally, we would be able to import named exports. But @rollup/plugin-commonjs does not support this yet
// see: https://github.com/rollup/plugins/issues/481
// import { compiledEsmFoo, compiledEsmBar } from '../src/compiled-esm-named-exports.js';
import compiledEsm from '../src/compiled-esm-named-exports.js';
import compiledEsmDefault from '../src/compiled-esm-default-exports.js';

import requiredDefault from '../src/require-default.js';
import { requiredNamedFoo, requiredNamedBar } from '../src/require-named.js';

const { expect } = chai;

describe('commonjs', () => {
  it('can handle default export', () => {
    expect(defaultFoo).to.equal('foo');
  });

  it('can handle named exports', () => {
    expect(namedFoo).to.equal('foo');
    expect(namedBar).to.equal('bar');
  });

  it('can handle compiled es modules with named exports', () => {
    expect(compiledEsm.compiledEsmFoo).to.equal('foo');
    expect(compiledEsm.compiledEsmBar).to.equal('bar');
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
