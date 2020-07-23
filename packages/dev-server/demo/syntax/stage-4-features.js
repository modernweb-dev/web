const foo = { a: 1 };
const bar = { ...foo };
const objectSpread = bar.a === 1;

async function asyncFunction() {}
const asyncFunctions = asyncFunction() instanceof Promise;

const exponentation = 2 ** 4 === 16;

class Foo {
  constructor() {
    this.foo = 'bar';
  }
}
const classes = new Foo().foo === 'bar';

const templateLiterals = `template ${'literal'}` === 'template literal';

const lorem = { ipsum: 'lorem ipsum' };
const optionalChaining = lorem?.ipsum === 'lorem ipsum' && lorem?.ipsum?.foo === undefined;
const buz = null;
const nullishCoalescing = (buz ?? 'nullish colaesced') === 'nullish colaesced';

window.__stage4 =
  objectSpread &&
  asyncFunctions &&
  exponentation &&
  classes &&
  templateLiterals &&
  optionalChaining &&
  nullishCoalescing;
