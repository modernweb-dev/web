import { expect } from '@esm-bundle/chai';
import { serialize } from '../src/serialize.js';
import { deserialize } from '../src/deserialize.js';

it('handles strings', () => {
  const serialized = serialize('foo');
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal('foo');
});

it('handles numbers', () => {
  const serialized = serialize(1);
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal(1);
});

it('handles Date', () => {
  const serialized = serialize(new Date('2020-07-25T12:00:00.000Z'));
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal('2020-07-25T12:00:00.000Z');
});

it('handles Function', () => {
  function foo(x: number, y: number) {
    return x * y;
  }
  const serialized = serialize(foo);
  const deserialized = deserialize(serialized);
  expect(typeof deserialized).to.equal('function');
  expect(deserialized.name).to.equal('foo');
});

it('handles Symbol', () => {
  const serialized = serialize(Symbol('foo'));
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal('Symbol(foo)');
});

it('handles arrow functions', () => {
  const foo = (x: number, y: number) => x * y;
  const serialized = serialize(foo);
  const deserialized = deserialize(serialized);
  expect(typeof deserialized).to.equal('function');
  expect(deserialized.name).to.equal('foo');
});

it('handles anonymous arrow functions', () => {
  const serialized = serialize((x: number, y: number) => x * y);
  const deserialized = deserialize(serialized);
  expect(typeof deserialized).to.equal('function');
  expect(deserialized.name).to.equal('');
});

it('handles Text nodes', () => {
  const serialized = serialize(document.createTextNode('hello world'));
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal('Text: hello world');
});

it('handles Comment nodes', () => {
  const serialized = serialize(document.createComment('hello world'));
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal('Comment: hello world');
});

it('handles HTMLElement', () => {
  const element = document.createElement('div');
  element.innerHTML = '<h1><span>Hello world</span></h1>';
  const serialized = serialize(element);
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal('HTMLDivElement: <div><h1><span>Hello world</span></h1></div>');
});

it('handles RegExp', () => {
  const serialized = serialize(/foo.*?\\/);
  const deserialized = deserialize(serialized);
  expect(deserialized instanceof RegExp).to.be.true;
  expect(deserialized.source).to.equal('foo.*?\\\\');
  expect(deserialized.flags).to.equal('');
});

it('handles RegExp with flags', () => {
  const serialized = serialize(new RegExp('foo.*?\\\\', 'g'));
  const deserialized = deserialize(serialized);
  expect(deserialized instanceof RegExp).to.be.true;
  expect(deserialized.source).to.equal('foo.*?\\\\');
  expect(deserialized.flags).to.equal('g');
});

it('handles URL', () => {
  const serialized = serialize(new URL('https://www.example.com'));
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal('https://www.example.com/');
});

it('handles URLSearchparams', () => {
  const serialized = serialize(new URLSearchParams('foo=bar&lorem=ipsum'));
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal('URLSearchParams: foo=bar&lorem=ipsum');
});

it('handles classes', () => {
  class Foo {
    a = 1;
    b = 2;
  }
  const serialized = serialize(new Foo());
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql({ a: 1, b: 2 });
  expect(deserialized.constructor.name).to.equal('Foo');
});

it('handles objects', () => {
  const serialized = serialize({ a: 1, b: 2 });
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql({ a: 1, b: 2 });
});

it('handles arrays', () => {
  const serialized = serialize([1, 2, 3]);
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql([1, 2, 3]);
});

it('handles objects', () => {
  const serialized = serialize({ a: 1, b: 2 });
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql({ a: 1, b: 2 });
});

it('handles objects with methods', () => {
  const serialized = serialize({
    foo() {
      return 'foo';
    },
    bar: () => {
      return 'bar';
    },
    baz: function baz() {
      return 'baz';
    },
  });
  const deserialized = deserialize(serialized);
  expect(deserialized.foo).to.be.a('function');
  expect(deserialized.foo.name).to.equal('foo');
  expect(deserialized.bar).to.be.a('function');
  expect(deserialized.bar.name).to.equal('bar');
  expect(deserialized.baz).to.be.a('function');
  expect(deserialized.baz.name).to.equal('baz');
});

it('handles deep objects', () => {
  const serialized = serialize({
    myNumber: 123,
    myString: 'foo',
    myObject: {
      myUrl: new URL('http://www.example.com/'),
      myMethod() {
        return 'x';
      },
      myRegExp: /x/,
    },
    myArray: [1, '2'],
  });
  const deserialized = deserialize(serialized);
  expect(deserialized.myNumber).to.equal(123);
  expect(deserialized.myString).to.equal('foo');
  expect(deserialized.myObject.myUrl).to.equal('http://www.example.com/');
  expect(deserialized.myObject.myMethod).to.be.a('function');
  expect(deserialized.myObject.myMethod.name).to.equal('myMethod');
  expect(deserialized.myObject.myRegExp).to.a('RegExp');
  expect(deserialized.myObject.myRegExp.source).to.equal('x');
  expect(deserialized.myArray).to.eql([1, '2']);
});

it('handles deep arrays', () => {
  class Foo {
    x = 'y';
  }
  const serialized = serialize([
    1,
    '2',
    /x/,
    new URL('http://www.example.com/'),
    Symbol('foo'),
    { a: 1, b: 2, c: new URLSearchParams('x=y'), d: new Foo() },
  ]);
  const deserialized = deserialize(serialized);
  expect(deserialized[0]).to.equal(1);
  expect(deserialized[1]).to.equal('2');
  expect(deserialized[2]).to.a('RegExp');
  expect(deserialized[2].source).to.equal('x');
  expect(deserialized[3]).to.equal('http://www.example.com/');
  expect(deserialized[4]).to.equal('Symbol(foo)');
  expect(deserialized[5].a).to.equal(1);
  expect(deserialized[5].b).to.equal(2);
  expect(deserialized[5].c).to.equal('URLSearchParams: x=y');
  expect(deserialized[5].d).to.eql({ x: 'y' });
  expect(deserialized[5].d.constructor.name).to.equal('Foo');
});

it('handles circular references', () => {
  const foo: Record<string, unknown> = {};
  foo.circular = foo;
  const serialized = serialize(foo);
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql({
    circular: '[Circular]',
  });
});

it('handles multiple circular references', () => {
  const foo: Record<string, unknown> = {};
  foo.circular1 = foo;
  foo.x = { circular2: foo, lorem: 'ipsum' };
  foo.y = { z: { a: 1, b: 2, circular3: foo } };
  const serialized = serialize(foo);
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql({
    circular1: '[Circular]',
    x: {
      circular2: '[Circular]',
      lorem: 'ipsum',
    },
    y: {
      z: {
        a: 1,
        b: 2,
        circular3: '[Circular]',
      },
    },
  });
});

it('handles circular references in arrays', () => {
  const foo: Record<string, unknown> = {};
  foo.circulars = [foo, 'bar', foo];
  const serialized = serialize(foo);
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql({ circulars: ['[Circular]', 'bar', '[Circular]'] });
});

it('handles generated circular references', () => {
  const Foo = () => null;
  const obj = { f: Foo, x: null };
  obj.x = obj;
  const serialized = serialize(obj);
  const deserialized = deserialize(serialized);
  expect(deserialized.f).to.be.a('function');
  expect(deserialized.x).to.equal('[Circular]');
});

it('handles errors', () => {
  const error = new Error('foo');
  const serialized = serialize(error);
  const deserialized = deserialize(serialized);
  expect(deserialized.__WTR_BROWSER_ERROR__).to.equal(true);
  expect(deserialized.message).to.equal(error.message);
  expect(deserialized.stack).to.equal(error.stack);
});

it('handles null', () => {
  const serialized = serialize(null);
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal(null);
});

it('handles undefined', () => {
  const serialized = serialize(undefined);
  const deserialized = deserialize(serialized);
  expect(deserialized).to.equal(undefined);
});

it('handles undefined in an object', () => {
  const serialized = serialize({ x: undefined });
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql({ x: undefined });
});

it('handles undefined in an array', () => {
  const serialized = serialize([1, undefined, '2', undefined]);
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql([1, undefined, '2', undefined]);
});

it('handles multiple undefined values', () => {
  const serialized = serialize({
    a: { a1: undefined, a2: undefined, a3: { x: undefined } },
    b: undefined,
    c: { q: [1, undefined] },
  });
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql({
    a: { a1: undefined, a2: undefined, a3: { x: undefined } },
    b: undefined,
    c: { q: [1, undefined] },
  });
});

it('handles Promises', () => {
  const serialized = serialize(new Promise((resolve)=>resolve(1)))
  const deserialized = deserialize(serialized);
  expect(deserialized).to.eql('Promise { }');
});
