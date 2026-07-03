import { expectIncludes } from '@web/dev-server-core/test-helpers';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';

import type { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';

import { deserialize } from '../dist/deserialize.js';

const serializeScript = fs.readFileSync(new URL('../dist/serialize.js', import.meta.url), 'utf-8');

const defaultOptions = { browserRootDir: import.meta.dirname, cwd: import.meta.dirname };

declare global {
  interface Window {
    _serialize: (value: unknown) => string;
  }
}

describe('serialize deserialize', { timeout: 10000 }, function () {
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
    const serialized = await page.evaluate(() => window['_serialize']('foo'));
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, 'foo');
  });

  it('handles numbers', async () => {
    const serialized = await page.evaluate(() => window['_serialize'](1));
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, 1);
  });

  it('handles Date', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize'](new Date('2020-07-25T12:00:00.000Z')),
    );
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, '2020-07-25T12:00:00.000Z');
  });

  it('handles Function', async () => {
    const serialized = await page.evaluate(() => {
      function foo(x: number, y: number) {
        return x * y;
      }
      return window['_serialize'](foo);
    });
    const deserialized = await deserialize(serialized);
    assert.equal(typeof deserialized, 'function');
    assert.equal(deserialized.name, 'foo');
  });

  it('handles bound Function', async () => {
    const serialized = await page.evaluate(() => {
      function foo(x: number, y: number) {
        return x * y;
      }
      return window['_serialize'](foo.bind(null));
    });
    const deserialized = await deserialize(serialized);
    assert.equal(typeof deserialized, 'function');
    assert.equal(deserialized.name, 'foo');
  });

  it('handles Symbol', async () => {
    const serialized = await page.evaluate(() => window['_serialize'](Symbol('foo')));
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, 'Symbol(foo)');
  });

  it('handles arrow functions', async () => {
    const serialized = await page.evaluate(() => {
      const foo = (x: number, y: number) => x * y;
      return window['_serialize'](foo);
    });
    const deserialized = await deserialize(serialized);
    assert.equal(typeof deserialized, 'function');
    assert.equal(deserialized.name, 'foo');
  });

  it('handles anonymous arrow functions', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize']((x: number, y: number) => x * y),
    );
    const deserialized = await deserialize(serialized);
    assert.equal(typeof deserialized, 'function');
    // Empty function names are sanitized to 'anonymous' for security
    assert.equal(deserialized.name, 'anonymous');
  });

  it('handles Text nodes', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize'](document.createTextNode('hello world')),
    );
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, 'Text: hello world');
  });

  it('handles Comment nodes', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize'](document.createComment('hello world')),
    );
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, 'Comment: hello world');
  });

  it('handles HTMLElement', async () => {
    const serialized = await page.evaluate(() => {
      const element = document.createElement('div');
      element.innerHTML = '<h1><span>Hello world</span></h1>';
      return window['_serialize'](element);
    });
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, 'HTMLDivElement: <div><h1><span>Hello world</span></h1></div>');
  });

  it('handles ShadowRoot', async () => {
    const serialized = await page.evaluate(() => {
      const element = document.createElement('div');
      element.attachShadow({ mode: 'open' });
      element.shadowRoot!.innerHTML = '<h1><span>Hello world</span></h1>';
      return window['_serialize'](element.shadowRoot);
    });
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, 'ShadowRoot: <h1><span>Hello world</span></h1>');
  });

  it('handles RegExp', async () => {
    const serialized = await page.evaluate(() => window['_serialize'](/foo.*?\\/));
    const deserialized = await deserialize(serialized);
    assert.ok(deserialized instanceof RegExp);
    assert.equal(deserialized.source, 'foo.*?\\\\');
    assert.equal(deserialized.flags, '');
  });

  it('handles RegExp with flags', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize'](new RegExp('foo.*?\\\\', 'g')),
    );
    const deserialized = await deserialize(serialized);
    assert.ok(deserialized instanceof RegExp);
    assert.equal(deserialized.source, 'foo.*?\\\\');
    assert.equal(deserialized.flags, 'g');
  });

  it('handles URL', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize'](new URL('https://www.example.com')),
    );
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, 'https://www.example.com/');
  });

  it('handles URLSearchparams', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize'](new URLSearchParams('foo=bar&lorem=ipsum')),
    );
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, 'URLSearchParams: foo=bar&lorem=ipsum');
  });

  it('handles classes', async () => {
    const serialized = await page.evaluate(() => {
      class Foo {
        a = 1;
        b = 2;
      }
      return window['_serialize'](new Foo());
    });
    const deserialized = await deserialize(serialized);
    assert.deepEqual({ ...deserialized }, { a: 1, b: 2 });
    assert.equal(deserialized.constructor.name, 'Foo');
  });

  it('handles objects', async () => {
    const serialized = await page.evaluate(() => window['_serialize']({ a: 1, b: 2 }));
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, { a: 1, b: 2 });
  });

  it('handles arrays', async () => {
    const serialized = await page.evaluate(() => window['_serialize']([1, 2, 3]));
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, [1, 2, 3]);
  });

  it('handles objects with methods', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize']({
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
    assert.equal(typeof deserialized.foo, 'function');
    assert.equal(deserialized.foo.name, 'foo');
    assert.equal(typeof deserialized.bar, 'function');
    assert.equal(deserialized.bar.name, 'bar');
    assert.equal(typeof deserialized.baz, 'function');
    assert.equal(deserialized.baz.name, 'baz');
    assert.equal(typeof deserialized['my-element'], 'function');
    // Names with hyphens are not valid JS identifiers, sanitized to 'anonymous' for security
    assert.equal(deserialized['my-element'].name, 'anonymous');
  });

  it('handles deep objects', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize']({
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
    assert.equal(deserialized.myNumber, 123);
    assert.equal(deserialized.myString, 'foo');
    assert.equal(deserialized.myObject.myUrl, 'http://www.example.com/');
    assert.equal(typeof deserialized.myObject.myMethod, 'function');
    assert.equal(deserialized.myObject.myMethod.name, 'myMethod');
    assert.ok(deserialized.myObject.myRegExp instanceof RegExp);
    assert.equal(deserialized.myObject.myRegExp.source, 'x');
    assert.deepEqual(deserialized.myArray, [1, '2']);
  });

  it('handles deep arrays', async () => {
    const serialized = await page.evaluate(() => {
      class Foo {
        x = 'y';
      }
      return window['_serialize']([
        1,
        '2',
        /x/,
        new URL('http://www.example.com/'),
        Symbol('foo'),
        { a: 1, b: 2, c: new URLSearchParams('x=y'), d: new Foo() },
      ]);
    });
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized[0], 1);
    assert.equal(deserialized[1], '2');
    assert.ok(deserialized[2] instanceof RegExp);
    assert.equal(deserialized[2].source, 'x');
    assert.equal(deserialized[3], 'http://www.example.com/');
    assert.equal(deserialized[4], 'Symbol(foo)');
    assert.equal(deserialized[5].a, 1);
    assert.equal(deserialized[5].b, 2);
    assert.equal(deserialized[5].c, 'URLSearchParams: x=y');
    assert.deepEqual({ ...deserialized[5].d }, { x: 'y' });
    assert.equal(deserialized[5].d.constructor.name, 'Foo');
  });

  it('handles circular references', async () => {
    const serialized = await page.evaluate(() => {
      const foo: Record<string, unknown> = {};
      foo.circular = foo;
      return window['_serialize'](foo);
    });
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, {
      circular: '[Circular]',
    });
  });

  it('handles multiple circular references', async () => {
    const serialized = await page.evaluate(() => {
      const foo: Record<string, unknown> = {};
      foo.circular1 = foo;
      foo.x = { circular2: foo, lorem: 'ipsum' };
      foo.y = { z: { a: 1, b: 2, circular3: foo } };
      return window['_serialize'](foo);
    });
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, {
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
      return window['_serialize'](foo);
    });
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, { circulars: ['[Circular]', 'bar', '[Circular]'] });
  });

  it('handles generated circular references', async () => {
    const serialized = await page.evaluate(() => {
      const Foo = () => null;
      const obj: any = { f: Foo, x: null };
      obj.x = obj;
      return window['_serialize'](obj);
    });
    const deserialized = await deserialize(serialized);
    assert.equal(typeof deserialized.f, 'function');
    assert.equal(deserialized.x, '[Circular]');
  });

  it('handles errors', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return window['_serialize'](a());
    });
    const deserialized = await deserialize(serialized, defaultOptions);
    assert.equal(typeof deserialized, 'string');
    expectIncludes(deserialized, 'my error msg');
    expectIncludes(deserialized, '2:23');
    expectIncludes(deserialized, '3:23');
    expectIncludes(deserialized, '4:23');
    expectIncludes(deserialized, '5:35');
  });

  it('handles errors in objects', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return window['_serialize']({ myError: a() });
    });
    const deserialized = await deserialize(serialized, defaultOptions);
    assert.equal(typeof deserialized.myError, 'string');
    expectIncludes(deserialized.myError, 'my error msg');
    expectIncludes(deserialized.myError, '2:23');
    expectIncludes(deserialized.myError, '3:23');
    expectIncludes(deserialized.myError, '4:23');
    expectIncludes(deserialized.myError, '5:46');
  });

  it('handles errors in arrays', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return window['_serialize']([a(), b(), c()]);
    });
    const deserialized = await deserialize(serialized, defaultOptions);
    assert.equal(typeof deserialized[0], 'string');
    expectIncludes(deserialized[0], 'my error msg');
    expectIncludes(deserialized[0], '2:23');
    expectIncludes(deserialized[0], '3:23');
    expectIncludes(deserialized[0], '4:23');
    expectIncludes(deserialized[0], '5:36');
    assert.equal(typeof deserialized[1], 'string');
    expectIncludes(deserialized[1], 'my error msg');
    expectIncludes(deserialized[1], '2:23');
    expectIncludes(deserialized[1], '3:23');
    expectIncludes(deserialized[1], '5:41');
    assert.equal(typeof deserialized[2], 'string');
    expectIncludes(deserialized[2], 'my error msg');
    expectIncludes(deserialized[2], '2:23');
    expectIncludes(deserialized[2], '5:46');
  });

  it('can map stack trace locations', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return window['_serialize'](a());
    });
    const deserialized = await deserialize(serialized, {
      ...defaultOptions,
      mapStackLocation: l => ({ ...l, filePath: `${l.filePath}__MAPPED__`, line: 1, column: 2 }),
    });
    assert.equal(typeof deserialized, 'string');
    expectIncludes(deserialized, 'my error msg');
    expectIncludes(deserialized, `__MAPPED__:1:2`);
  });

  it('mapped stack traces can be async', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return window['_serialize'](a());
    });
    const deserialized = await deserialize(serialized, {
      ...defaultOptions,
      async mapStackLocation(l) {
        await new Promise(r => setTimeout(r, 100));
        return { ...l, filePath: `${l.filePath}__MAPPED__`, line: 1, column: 2 };
      },
    });
    assert.equal(typeof deserialized, 'string');
    expectIncludes(deserialized, 'my error msg');
    expectIncludes(deserialized, `__MAPPED__:1:2`);
  });

  it('can define a cwd below current directory', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return window['_serialize'](a());
    });
    const deserialized = await deserialize(serialized, {
      ...defaultOptions,
      cwd: path.resolve(import.meta.dirname, '..'),
    });
    assert.equal(typeof deserialized, 'string');
    expectIncludes(deserialized, 'my error msg');
    expectIncludes(deserialized, `2:23`);
    expectIncludes(deserialized, `3:23`);
    expectIncludes(deserialized, `4:23`);
    expectIncludes(deserialized, `5:35`);
  });

  it('can define a cwd above current directory', async () => {
    const serialized = await page.evaluate(() => {
      const c = () => new Error('my error msg');
      const b = () => c();
      const a = () => b();
      return window['_serialize'](a());
    });
    const deserialized = await deserialize(serialized, {
      cwd: path.resolve(import.meta.dirname, '..', 'foo'),
      browserRootDir: path.resolve(import.meta.dirname, '..'),
    });
    assert.equal(typeof deserialized, 'string');
    expectIncludes(deserialized, 'my error msg');
    expectIncludes(deserialized, `2:23`);
    expectIncludes(deserialized, `3:23`);
    expectIncludes(deserialized, `4:23`);
    expectIncludes(deserialized, `5:35`);
  });

  it('handles null', async () => {
    const serialized = await page.evaluate(() => window['_serialize'](null));
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, null);
  });

  it('handles undefined', async () => {
    const serialized = await page.evaluate(() => window['_serialize'](undefined));
    const deserialized = await deserialize(serialized);
    assert.equal(deserialized, undefined);
  });

  it('handles undefined in an object', async () => {
    const serialized = await page.evaluate(() => window['_serialize']({ x: undefined }));
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, { x: undefined });
  });

  it('handles undefined in an array', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize']([1, undefined, '2', undefined]),
    );
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, [1, undefined, '2', undefined]);
  });

  it('handles multiple undefined values', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize']({
        a: { a1: undefined, a2: undefined, a3: { x: undefined } },
        b: undefined,
        c: { q: [1, undefined] },
      }),
    );
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, {
      a: { a1: undefined, a2: undefined, a3: { x: undefined } },
      b: undefined,
      c: { q: [1, undefined] },
    });
  });

  it('handles Promises', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize'](new Promise(resolve => resolve(1))),
    );
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, 'Promise { }');
  });

  it('handles errors thrown during serialization', async () => {
    const serialized = await page.evaluate(() =>
      window['_serialize']({
        get x() {
          throw new Error('error in getter');
        },
      }),
    );
    const deserialized = await deserialize(serialized);
    assert.deepEqual(deserialized, null);
  });
});

describe('deserialize security', function () {
  describe('constructor name injection prevention', function () {
    it('sanitizes constructor names with code injection payloads', async () => {
      // This payload would execute arbitrary code if interpolated directly into new Function(...)
      const maliciousPayload = JSON.stringify({
        __WTR_CONSTRUCTOR_NAME__: 'x(){},(globalThis.PWNED=true),function y',
        data: 'test',
      });

      const deserialized = await deserialize(maliciousPayload);

      // The malicious code should NOT have executed
      assert.equal((globalThis as any).PWNED, undefined);
      // The object should still be deserialized with a safe fallback name
      assert.equal(deserialized.constructor.name, '__unknown__');
      assert.equal(deserialized.data, 'test');
    });

    it('sanitizes constructor names with require() injection', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_CONSTRUCTOR_NAME__:
          'x(){},require("child_process").execSync("echo PWNED"),function y',
        value: 123,
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(deserialized.constructor.name, '__unknown__');
      assert.equal(deserialized.value, 123);
    });

    it('sanitizes constructor names with parentheses', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_CONSTRUCTOR_NAME__: 'Foo()',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(deserialized.constructor.name, '__unknown__');
    });

    it('sanitizes constructor names with spaces', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_CONSTRUCTOR_NAME__: 'Foo Bar',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(deserialized.constructor.name, '__unknown__');
    });

    it('sanitizes constructor names with semicolons', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_CONSTRUCTOR_NAME__: 'Foo;console.log("pwned")',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(deserialized.constructor.name, '__unknown__');
    });

    it('sanitizes constructor names with curly braces', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_CONSTRUCTOR_NAME__: 'Foo{}',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(deserialized.constructor.name, '__unknown__');
    });

    it('sanitizes constructor names with commas', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_CONSTRUCTOR_NAME__: 'x,y',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(deserialized.constructor.name, '__unknown__');
    });

    it('sanitizes empty constructor names', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_CONSTRUCTOR_NAME__: '',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(deserialized.constructor.name, '__unknown__');
    });

    it('sanitizes constructor names starting with digits', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_CONSTRUCTOR_NAME__: '123Foo',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(deserialized.constructor.name, '__unknown__');
    });

    it('allows valid constructor names', async () => {
      const validNames = ['Foo', 'FooBar', '_Foo', '$Foo', 'Foo123', '_$foo_bar_123'];

      for (const name of validNames) {
        const payload = JSON.stringify({
          __WTR_CONSTRUCTOR_NAME__: name,
        });

        const deserialized = await deserialize(payload);
        assert.equal(deserialized.constructor.name, name, `Expected ${name} to be allowed`);
      }
    });
  });

  describe('function name injection prevention', function () {
    it('sanitizes function names with code injection payloads', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_TYPE__: 'Function',
        name: 'x(){},(globalThis.PWNED_FN=true),function y',
      });

      const deserialized = await deserialize(maliciousPayload);

      // The malicious code should NOT have executed
      assert.equal((globalThis as any).PWNED_FN, undefined);
      // The function should still be deserialized with a safe fallback name
      assert.equal(typeof deserialized, 'function');
      assert.equal(deserialized.name, 'anonymous');
    });

    it('sanitizes function names with require() injection', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_TYPE__: 'Function',
        name: 'x(){},require("child_process"),function y',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(typeof deserialized, 'function');
      assert.equal(deserialized.name, 'anonymous');
    });

    it('sanitizes function names with parentheses', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_TYPE__: 'Function',
        name: 'foo()',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(typeof deserialized, 'function');
      assert.equal(deserialized.name, 'anonymous');
    });

    it('sanitizes function names with spaces', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_TYPE__: 'Function',
        name: 'foo bar',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(typeof deserialized, 'function');
      assert.equal(deserialized.name, 'anonymous');
    });

    it('sanitizes empty function names', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_TYPE__: 'Function',
        name: '',
      });

      const deserialized = await deserialize(maliciousPayload);
      assert.equal(typeof deserialized, 'function');
      assert.equal(deserialized.name, 'anonymous');
    });

    it('handles bound function prefix with malicious payload', async () => {
      const maliciousPayload = JSON.stringify({
        __WTR_TYPE__: 'Function',
        name: 'bound x(){},(globalThis.PWNED_BOUND=true),function y',
      });

      const deserialized = await deserialize(maliciousPayload);

      assert.equal((globalThis as any).PWNED_BOUND, undefined);
      assert.equal(typeof deserialized, 'function');
      assert.equal(deserialized.name, 'anonymous');
    });

    it('allows valid function names', async () => {
      const validNames = ['foo', 'fooBar', '_foo', '$foo', 'foo123', '_$foo_bar_123'];

      for (const name of validNames) {
        const payload = JSON.stringify({
          __WTR_TYPE__: 'Function',
          name: name,
        });

        const deserialized = await deserialize(payload);
        assert.equal(typeof deserialized, 'function');
        assert.equal(deserialized.name, name, `Expected ${name} to be allowed`);
      }
    });

    it('allows valid bound function names', async () => {
      const payload = JSON.stringify({
        __WTR_TYPE__: 'Function',
        name: 'bound myFunction',
      });

      const deserialized = await deserialize(payload);
      assert.equal(typeof deserialized, 'function');
      assert.equal(deserialized.name, 'myFunction');
    });
  });

  describe('nested injection prevention', function () {
    it('sanitizes malicious names in nested objects', async () => {
      const maliciousPayload = JSON.stringify({
        nested: {
          __WTR_CONSTRUCTOR_NAME__: 'x(){},(globalThis.NESTED_PWNED=true),function y',
          data: 'nested data',
        },
      });

      const deserialized = await deserialize(maliciousPayload);

      assert.equal((globalThis as any).NESTED_PWNED, undefined);
      assert.equal(deserialized.nested.constructor.name, '__unknown__');
      assert.equal(deserialized.nested.data, 'nested data');
    });

    it('sanitizes malicious function names in arrays', async () => {
      const maliciousPayload = JSON.stringify([
        {
          __WTR_TYPE__: 'Function',
          name: 'x(){},(globalThis.ARRAY_PWNED=true),function y',
        },
      ]);

      const deserialized = await deserialize(maliciousPayload);

      assert.equal((globalThis as any).ARRAY_PWNED, undefined);
      assert.equal(typeof deserialized[0], 'function');
      assert.equal(deserialized[0].name, 'anonymous');
    });
  });
});
