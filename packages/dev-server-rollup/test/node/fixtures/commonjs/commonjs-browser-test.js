import '../../../../../../node_modules/chai/chai.js';
import defaultFoo from './modules/default-export.js';
import { namedFoo, namedBar } from './modules/named-exports.js';

// TODO: Ideally, we would be able to import named exports. But @rollup/plugin-commonjs does not support this yet
// see: https://github.com/rollup/plugins/issues/481
// import { compiledEsmFoo, compiledEsmBar } from '../src/compiled-esm-named-exports.js';
import compiledEsm from './modules/compiled-esm-named-exports.js';
import compiledEsmDefault from './modules/compiled-esm-default-exports.js';

import requiredDefault from './modules/require-default.js';
import { requiredNamedFoo, requiredNamedBar } from './modules/require-named.js';

const { expect } = window.chai;

describe('commonjs', () => {
  it('can handle default export', () => {
    console.log({ defaultFoo });
    expect(defaultFoo).to.equal('foo');
  });

  it('can handle named exports', () => {
    console.log({ namedFoo });
    console.log({ namedBar });
    expect(namedFoo).to.equal('foo');
    expect(namedBar).to.equal('bar');
  });

  it('can handle compiled es modules with named exports', () => {
    console.log({ compiledEsm });
    expect(compiledEsm.compiledEsmFoo).to.equal('foo');
    expect(compiledEsm.compiledEsmBar).to.equal('bar');
  });

  it('can handle compiled es modules with a default export', () => {
    console.log({ compiledEsmDefault });
    expect(compiledEsmDefault).to.equal('bar');
  });

  it('can handle require default', () => {
    console.log({ requiredDefault });
    expect(requiredDefault).to.equal('foo');
  });

  it('can handle require named', () => {
    console.log({ requiredNamedFoo });
    console.log({ requiredNamedBar });
    expect(requiredNamedFoo).to.equal('foo');
    expect(requiredNamedBar).to.equal('bar');
  });
});
