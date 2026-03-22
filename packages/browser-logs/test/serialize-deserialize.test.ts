import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';

import { deserialize } from '../src/deserialize.ts';

const __dirname = import.meta.dirname;
const serializeScript = fs.readFileSync(new URL('../dist/serialize.js', import.meta.url), 'utf-8');
const defaultOptions = { browserRootDir: __dirname, cwd: __dirname };

describe('serialize deserialize', function () {
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
    assert.strictEqual(deserialized, 'foo');
  });

  it('handles numbers', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(1));
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, 1);
  });

  it('handles Date', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(new Date('2020-07-25T12:00:00.000Z')),
    );
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, '2020-07-25T12:00:00.000Z');
  });

  it('handles Function', async () => {
    const serialized = await page.evaluate(() => {
      function foo(x: number, y: number) {
        return x * y;
      }
      return (window as any)._serialize(foo);
    });
    const deserialized = await deserialize(serialized);
    assert.strictEqual(typeof deserialized, 'function');
    assert.strictEqual(deserialized.name, 'foo');
  });

  it('handles bound Function', async () => {
    const serialized = await page.evaluate(() => {
      function foo(x: number, y: number) {
        return x * y;
      }
      return (window as any)._serialize(foo.bind(null));
    });
    const deserialized = await deserialize(serialized);
    assert.strictEqual(typeof deserialized, 'function');
    assert.strictEqual(deserialized.name, 'foo');
  });

  it('handles Symbol', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(Symbol('foo')));
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, 'Symbol(foo)');
  });

  it('handles arrow functions', async () => {
    const serialized = await page.evaluate(() => {
      const foo = (x: number, y: number) => x * y;
      return (window as any)._serialize(foo);
    });
    const deserialized = await deserialize(serialized);
    assert.strictEqual(typeof deserialized, 'function');
    assert.strictEqual(deserialized.name, 'foo');
  });

  it('handles anonymous arrow functions', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize((x: number, y: number) => x * y),
    );
    const deserialized = await deserialize(serialized);
    assert.strictEqual(typeof deserialized, 'function');
    assert.strictEqual(deserialized.name, '');
  });

  it('handles Text nodes', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(document.createTextNode('hello world')),
    );
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, 'Text: hello world');
  });

  it('handles Comment nodes', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(document.createComment('hello world')),
    );
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, 'Comment: hello world');
  });

  it('handles HTMLElement', async () => {
    const serialized = await page.evaluate(() => {
      const element = document.createElement('div');
      element.innerHTML = '<h1><span>Hello world</span></h1>';
      return (window as any)._serialize(element);
    });
    const deserialized = await deserialize(serialized);
    assert.strictEqual(
      deserialized,
      'HTMLDivElement: <div><h1><span>Hello world</span></h1></div>',
    );
  });

  it('handles ShadowRoot', async () => {
    const serialized = await page.evaluate(() => {
      const element = document.createElement('div');
      element.attachShadow({ mode: 'open' });
      element.shadowRoot!.innerHTML = '<h1><span>Hello world</span></h1>';
      return (window as any)._serialize(element.shadowRoot);
    });
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, 'ShadowRoot: <h1><span>Hello world</span></h1>');
  });

  it('handles RegExp', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(/foo.*?\\/));
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized instanceof RegExp, true);
    assert.strictEqual(deserialized.source, 'foo.*?\\\\');
    assert.strictEqual(deserialized.flags, '');
  });

  it('handles RegExp with flags', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(new RegExp('foo.*?\\\\', 'g')),
    );
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized instanceof RegExp, true);
    assert.strictEqual(deserialized.source, 'foo.*?\\\\');
    assert.strictEqual(deserialized.flags, 'g');
  });

  it('handles URL', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(new URL('https://www.example.com')),
    );
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, 'https://www.example.com/');
  });

  it('handles URLSearchparams', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize(new URLSearchParams('foo=bar&lorem=ipsum')),
    );
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, 'URLSearchParams: foo=bar&lorem=ipsum');
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
    assert.strictEqual(deserialized.a, 1);
    assert.strictEqual(deserialized.b, 2);
    assert.strictEqual(deserialized.constructor.name, 'Foo');
  });

  it('handles objects', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize({ a: 1, b: 2 }));
    const deserialized = await deserialize(serialized);
    assert.deepStrictEqual(deserialized, { a: 1, b: 2 });
  });

  it('handles arrays', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize([1, 2, 3]));
    const deserialized = await deserialize(serialized);
    assert.deepStrictEqual(deserialized, [1, 2, 3]);
  });

  it('handles objects', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize({ a: 1, b: 2 }));
    const deserialized = await deserialize(serialized);
    assert.deepStrictEqual(deserialized, { a: 1, b: 2 });
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
    assert.strictEqual(typeof deserialized.foo, 'function');
    assert.strictEqual(deserialized.foo.name, 'foo');
    assert.strictEqual(typeof deserialized.bar, 'function');
    assert.strictEqual(deserialized.bar.name, 'bar');
    assert.strictEqual(typeof deserialized.baz, 'function');
    assert.strictEqual(deserialized.baz.name, 'baz');
    assert.strictEqual(typeof deserialized['my-element'], 'function');
    assert.strictEqual(deserialized['my-element'].name, 'my-element');
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
    assert.strictEqual(deserialized.myNumber, 123);
    assert.strictEqual(deserialized.myString, 'foo');
    assert.strictEqual(deserialized.myObject.myUrl, 'http://www.example.com/');
    assert.strictEqual(typeof deserialized.myObject.myMethod, 'function');
    assert.strictEqual(deserialized.myObject.myMethod.name, 'myMethod');
    assert.ok(deserialized.myObject.myRegExp instanceof RegExp);
    assert.strictEqual(deserialized.myObject.myRegExp.source, 'x');
    assert.deepStrictEqual(deserialized.myArray, [1, '2']);
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
    assert.strictEqual(deserialized[0], 1);
    assert.strictEqual(deserialized[1], '2');
    assert.ok(deserialized[2] instanceof RegExp);
    assert.strictEqual(deserialized[2].source, 'x');
    assert.strictEqual(deserialized[3], 'http://www.example.com/');
    assert.strictEqual(deserialized[4], 'Symbol(foo)');
    assert.strictEqual(deserialized[5].a, 1);
    assert.strictEqual(deserialized[5].b, 2);
    assert.strictEqual(deserialized[5].c, 'URLSearchParams: x=y');
    assert.strictEqual(deserialized[5].d.x, 'y');
    assert.strictEqual(deserialized[5].d.constructor.name, 'Foo');
  });

  it('handles circular references', async () => {
    const serialized = await page.evaluate(() => {
      const foo: Record<string, unknown> = {};
      foo.circular = foo;
      return (window as any)._serialize(foo);
    });
    const deserialized = await deserialize(serialized);
    assert.deepStrictEqual(deserialized, {
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
    assert.deepStrictEqual(deserialized, {
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
    assert.deepStrictEqual(deserialized, { circulars: ['[Circular]', 'bar', '[Circular]'] });
  });

  it('handles generated circular references', async () => {
    const serialized = await page.evaluate(() => {
      const Foo = () => null;
      const obj: any = { f: Foo, x: null };
      obj.x = obj;
      return (window as any)._serialize(obj);
    });
    const deserialized = await deserialize(serialized);
    assert.strictEqual(typeof deserialized.f, 'function');
    assert.strictEqual(deserialized.x, '[Circular]');
  });

  it('handles errors', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize(a());
    });
    const deserialized = await deserialize(serialized, defaultOptions);
    assert.strictEqual(typeof deserialized, 'string');
    assert.ok(deserialized.includes('my error msg'));
    assert.ok(deserialized.includes('2:23'));
    assert.ok(deserialized.includes('3:23'));
    assert.ok(deserialized.includes('4:23'));
  });

  it('handles errors in objects', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize({ myError: a() });
    });
    const deserialized = await deserialize(serialized, defaultOptions);
    assert.strictEqual(typeof deserialized.myError, 'string');
    assert.ok(deserialized.myError.includes('my error msg'));
    assert.ok(deserialized.myError.includes('2:23'));
    assert.ok(deserialized.myError.includes('3:23'));
    assert.ok(deserialized.myError.includes('4:23'));
  });

  it('handles errors in arrays', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return (window as any)._serialize([a(), b(), c()]);
    });
    const deserialized = await deserialize(serialized, defaultOptions);
    assert.strictEqual(typeof deserialized[0], 'string');
    assert.ok(deserialized[0].includes('my error msg'));
    assert.ok(deserialized[0].includes('2:23'));
    assert.ok(deserialized[0].includes('3:23'));
    assert.ok(deserialized[0].includes('4:23'));
    assert.strictEqual(typeof deserialized[1], 'string');
    assert.ok(deserialized[1].includes('my error msg'));
    assert.ok(deserialized[1].includes('2:23'));
    assert.ok(deserialized[1].includes('3:23'));
    assert.strictEqual(typeof deserialized[2], 'string');
    assert.ok(deserialized[2].includes('my error msg'));
    assert.ok(deserialized[2].includes('2:23'));
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
    assert.strictEqual(typeof deserialized, 'string');
    assert.ok(deserialized.includes('my error msg'));
    assert.ok(deserialized.includes(`__MAPPED__:1:2`));
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
    assert.strictEqual(typeof deserialized, 'string');
    assert.ok(deserialized.includes('my error msg'));
    assert.ok(deserialized.includes(`__MAPPED__:1:2`));
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
    assert.strictEqual(typeof deserialized, 'string');
    assert.ok(deserialized.includes('my error msg'));
    assert.ok(deserialized.includes(`2:23`));
    assert.ok(deserialized.includes(`3:23`));
    assert.ok(deserialized.includes(`4:23`));
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
    assert.strictEqual(typeof deserialized, 'string');
    assert.ok(deserialized.includes('my error msg'));
    assert.ok(deserialized.includes(`2:23`));
    assert.ok(deserialized.includes(`3:23`));
    assert.ok(deserialized.includes(`4:23`));
  });

  it('handles null', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(null));
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, null);
  });

  it('handles undefined', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize(undefined));
    const deserialized = await deserialize(serialized);
    assert.strictEqual(deserialized, undefined);
  });

  it('handles undefined in an object', async () => {
    const serialized = await page.evaluate(() => (window as any)._serialize({ x: undefined }));
    const deserialized = await deserialize(serialized);
    assert.deepStrictEqual(deserialized, { x: undefined });
  });

  it('handles undefined in an array', async () => {
    const serialized = await page.evaluate(() =>
      (window as any)._serialize([1, undefined, '2', undefined]),
    );
    const deserialized = await deserialize(serialized);
    assert.deepStrictEqual(deserialized, [1, undefined, '2', undefined]);
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
    assert.deepStrictEqual(deserialized, {
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
    assert.deepStrictEqual(deserialized, 'Promise { }');
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
    assert.deepStrictEqual(deserialized, null);
  });
});
