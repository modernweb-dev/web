import { expect } from 'chai';
import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';

import { deserialize } from '../src/deserialize.js';

const serializeScript = fs.readFileSync(require.resolve('../dist/serialize.js'), 'utf-8');
const defaultOptions = { browserRootDir: __dirname, cwd: __dirname };

describe('serialize deserialize', function () {
  this.timeout(10000);

  let browser: Browser;
  let page: Page;
  before(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('about:blank');
    await page.evaluate(
      `(function () { var module = {}; var exports = {}; \n${serializeScript};\n window._serialize = serialize })()`,
    );
  });

  after(async () => {
    await browser.close();
  });

  it('handles strings', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize('foo'));
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal('foo');
  });

  it('handles numbers', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(1));
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal(1);
  });

  it('handles Date', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(new Date('2020-07-25T12:00:00.000Z')),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal('2020-07-25T12:00:00.000Z');
  });

  it('handles Function', async () => {
    const serialized = await page.evaluate(() => {
      function foo(x: number, y: number) {
        return x * y;
      }
      return (window as any)._serialize(foo);
    });
    const deserialized = await deserialize(serialized);
    expect(typeof deserialized).to.equal('function');
    expect(deserialized.name).to.equal('foo');
  });

  it('handles bound Function', async () => {
    const serialized = await page.evaluate(() => {
      function foo(x: number, y: number) {
        return x * y;
      }
      return (window as any)._serialize(foo.bind(null));
    });
    const deserialized = await deserialize(serialized);
    expect(typeof deserialized).to.equal('function');
    expect(deserialized.name).to.equal('foo');
  });

  it('handles Symbol', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(Symbol('foo')));
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal('Symbol(foo)');
  });

  it('handles arrow functions', async () => {
    const serialized = await page.evaluate(() => {
      const foo = (x: number, y: number) => x * y;
      return (window as any)._serialize(foo);
    });
    const deserialized = await deserialize(serialized);
    expect(typeof deserialized).to.equal('function');
    expect(deserialized.name).to.equal('foo');
  });

  it('handles anonymous arrow functions', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize((x: number, y: number) => x * y),
    );
    const deserialized = await deserialize(serialized);
    expect(typeof deserialized).to.equal('function');
    expect(deserialized.name).to.equal('');
  });

  it('handles Text nodes', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(document.createTextNode('hello world')),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal('Text: hello world');
  });

  it('handles Comment nodes', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(document.createComment('hello world')),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal('Comment: hello world');
  });

  it('handles HTMLElement', async () => {
    const serialized = await page.evaluate(() => {
      const element = document.createElement('div');
      element.innerHTML = '<h1><span>Hello world</span></h1>';
      return (window as any)._serialize(element);
    });
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal('HTMLDivElement: <div><h1><span>Hello world</span></h1></div>');
  });

  it('handles ShadowRoot', async () => {
    const serialized = await page.evaluate(() => {
      const element = document.createElement('div');
      element.attachShadow({ mode: 'open' });
      element.shadowRoot!.innerHTML = '<h1><span>Hello world</span></h1>';
      return (window as any)._serialize(element.shadowRoot);
    });
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal('ShadowRoot: <h1><span>Hello world</span></h1>');
  });

  it('handles RegExp', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(/foo.*?\\/));
    const deserialized = await deserialize(serialized);
    expect(deserialized instanceof RegExp).to.be.true;
    expect(deserialized.source).to.equal('foo.*?\\\\');
    expect(deserialized.flags).to.equal('');
  });

  it('handles RegExp with flags', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(new RegExp('foo.*?\\\\', 'g')),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized instanceof RegExp).to.be.true;
    expect(deserialized.source).to.equal('foo.*?\\\\');
    expect(deserialized.flags).to.equal('g');
  });

  it('handles URL', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(new URL('https://www.example.com')),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal('https://www.example.com/');
  });

  it('handles URLSearchparams', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(new URLSearchParams('foo=bar&lorem=ipsum')),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal('URLSearchParams: foo=bar&lorem=ipsum');
  });

  it('handles classes', async () => {
    const serialized = await page.evaluate(() => {
      class Foo {
        a = 1;
        b = 2;
      }
      return (window as any)._serialize(new Foo());
    });
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql({ a: 1, b: 2 });
    expect(deserialized.constructor.name).to.equal('Foo');
  });

  it('handles objects', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize({ a: 1, b: 2 }));
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql({ a: 1, b: 2 });
  });

  it('handles arrays', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize([1, 2, 3]));
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql([1, 2, 3]);
  });

  it('handles objects', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize({ a: 1, b: 2 }));
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql({ a: 1, b: 2 });
  });

  it('handles objects with methods', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize({
        foo() {
          return 'foo';
        },
        bar: () => {
          return 'bar';
        },
        baz: function baz() {
          return 'baz';
        },
        'my-element': () => 'bar',
      }),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized.foo).to.be.a('function');
    expect(deserialized.foo.name).to.equal('foo');
    expect(deserialized.bar).to.be.a('function');
    expect(deserialized.bar.name).to.equal('bar');
    expect(deserialized.baz).to.be.a('function');
    expect(deserialized.baz.name).to.equal('baz');
    expect(deserialized['my-element']).to.be.a('function');
    expect(deserialized['my-element'].name).to.equal('my-element');
  });

  it('handles deep objects', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize({
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
      }),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized.myNumber).to.equal(123);
    expect(deserialized.myString).to.equal('foo');
    expect(deserialized.myObject.myUrl).to.equal('http://www.example.com/');
    expect(deserialized.myObject.myMethod).to.be.a('function');
    expect(deserialized.myObject.myMethod.name).to.equal('myMethod');
    expect(deserialized.myObject.myRegExp).to.a('RegExp');
    expect(deserialized.myObject.myRegExp.source).to.equal('x');
    expect(deserialized.myArray).to.eql([1, '2']);
  });

  it('handles deep arrays', async () => {
    const serialized = await page.evaluate(() => {
      class Foo {
        x = 'y';
      }
      return (window as any)._serialize([
        1,
        '2',
        /x/,
        new URL('http://www.example.com/'),
        Symbol('foo'),
        { a: 1, b: 2, c: new URLSearchParams('x=y'), d: new Foo() },
      ]);
    });
    const deserialized = await deserialize(serialized);
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

  it('handles circular references', async () => {
    const serialized = await page.evaluate(() => {
      const foo: Record<string, unknown> = {};
      foo.circular = foo;
      return (window as any)._serialize(foo);
    });
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql({
      circular: '[Circular]',
    });
  });

  it('handles multiple circular references', async () => {
    const serialized = await page.evaluate(() => {
      const foo: Record<string, unknown> = {};
      foo.circular1 = foo;
      foo.x = { circular2: foo, lorem: 'ipsum' };
      foo.y = { z: { a: 1, b: 2, circular3: foo } };
      return (window as any)._serialize(foo);
    });
    const deserialized = await deserialize(serialized);
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

  it('handles circular references in arrays', async () => {
    const serialized = await page.evaluate(() => {
      const foo: Record<string, unknown> = {};
      foo.circulars = [foo, 'bar', foo];
      return (window as any)._serialize(foo);
    });
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql({ circulars: ['[Circular]', 'bar', '[Circular]'] });
  });

  it('handles generated circular references', async () => {
    const serialized = await page.evaluate(() => {
      const Foo = () => null;
      const obj: any = { f: Foo, x: null };
      obj.x = obj;
      return (window as any)._serialize(obj);
    });
    const deserialized = await deserialize(serialized);
    expect(deserialized.f).to.be.a('function');
    expect(deserialized.x).to.equal('[Circular]');
  });

  it('handles errors', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize(a());
    });
    const deserialized = await deserialize(serialized, defaultOptions);
    expect(deserialized).to.be.a('string');
    expect(deserialized).to.include('my error msg');
    expect(deserialized).to.include('2:29');
    expect(deserialized).to.include('3:29');
    expect(deserialized).to.include('4:29');
    expect(deserialized).to.include('5:38');
  });

  it('handles errors in objects', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize({ myError: a() });
    });
    const deserialized = await deserialize(serialized, defaultOptions);
    expect(deserialized.myError).to.be.a('string');
    expect(deserialized.myError).to.include('my error msg');
    expect(deserialized.myError).to.include('2:29');
    expect(deserialized.myError).to.include('3:29');
    expect(deserialized.myError).to.include('4:29');
    expect(deserialized.myError).to.include('5:49');
  });

  it('handles errors in arrays', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize([a(), b(), c()]);
    });
    const deserialized = await deserialize(serialized, defaultOptions);
    expect(deserialized[0]).to.be.a('string');
    expect(deserialized[0]).to.include('my error msg');
    expect(deserialized[0]).to.include('2:29');
    expect(deserialized[0]).to.include('3:29');
    expect(deserialized[0]).to.include('4:29');
    expect(deserialized[0]).to.include('5:39');
    expect(deserialized[1]).to.be.a('string');
    expect(deserialized[1]).to.include('my error msg');
    expect(deserialized[1]).to.include('2:29');
    expect(deserialized[1]).to.include('3:29');
    expect(deserialized[1]).to.include('5:44');
    expect(deserialized[2]).to.be.a('string');
    expect(deserialized[2]).to.include('my error msg');
    expect(deserialized[2]).to.include('2:29');
    expect(deserialized[2]).to.include('5:49');
  });

  it('can map stack trace locations', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize(a());
    });
    const deserialized = await deserialize(serialized, {
      ...defaultOptions,
      mapStackLocation: l => ({ ...l, filePath: `${l.filePath}__MAPPED__`, line: 1, column: 2 }),
    });
    expect(deserialized).to.be.a('string');
    expect(deserialized).to.include('my error msg');
    expect(deserialized).to.include(`__MAPPED__:1:2`);
  });

  it('mapped stack traces can be async', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize(a());
    });
    const deserialized = await deserialize(serialized, {
      ...defaultOptions,
      async mapStackLocation(l) {
        await new Promise(r => setTimeout(r, 100));
        return { ...l, filePath: `${l.filePath}__MAPPED__`, line: 1, column: 2 };
      },
    });
    expect(deserialized).to.be.a('string');
    expect(deserialized).to.include('my error msg');
    expect(deserialized).to.include(`__MAPPED__:1:2`);
  });

  it('can define a cwd below current directory', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize(a());
    });
    const deserialized = await deserialize(serialized, {
      ...defaultOptions,
      cwd: path.resolve(__dirname, '..'),
    });
    expect(deserialized).to.be.a('string');
    expect(deserialized).to.include('my error msg');
    expect(deserialized).to.include(`2:29`);
    expect(deserialized).to.include(`3:29`);
    expect(deserialized).to.include(`4:29`);
    expect(deserialized).to.include(`5:38`);
  });

  it('can define a cwd above current directory', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize(a());
    });
    const deserialized = await deserialize(serialized, {
      cwd: path.resolve(__dirname, '..', 'foo'),
      browserRootDir: path.resolve(__dirname, '..'),
    });
    expect(deserialized).to.be.a('string');
    expect(deserialized).to.include('my error msg');
    expect(deserialized).to.include(`2:29`);
    expect(deserialized).to.include(`3:29`);
    expect(deserialized).to.include(`4:29`);
    expect(deserialized).to.include(`5:38`);
  });

  it('handles null', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(null));
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal(null);
  });

  it('handles undefined', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(undefined));
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.equal(undefined);
  });

  it('handles undefined in an object', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize({ x: undefined }));
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql({ x: undefined });
  });

  it('handles undefined in an array', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize([1, undefined, '2', undefined]),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql([1, undefined, '2', undefined]);
  });

  it('handles multiple undefined values', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize({
        a: { a1: undefined, a2: undefined, a3: { x: undefined } },
        b: undefined,
        c: { q: [1, undefined] },
      }),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql({
      a: { a1: undefined, a2: undefined, a3: { x: undefined } },
      b: undefined,
      c: { q: [1, undefined] },
    });
  });

  it('handles Promises', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(new Promise(resolve => resolve(1))),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql('Promise { }');
  });

  it('handles errors thrown during serialization', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize({
        get x() {
          throw new Error('error in getter');
        },
      }),
    );
    const deserialized = await deserialize(serialized);
    expect(deserialized).to.eql(null);
  });
});
