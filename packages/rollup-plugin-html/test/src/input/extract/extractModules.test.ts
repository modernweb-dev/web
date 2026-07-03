import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parse, serialize } from 'parse5';
import path from 'path';
import { html, js } from '../../../../../../test-utils/rollup-test-utils.js';

import { extractModules } from '../../../../dist/input/extract/extractModules.js';
import type { ScriptModuleTag } from '../../../../dist/RollupPluginHTMLOptions.js';

const { sep } = path;

function cleanupInlineModules(modules: ScriptModuleTag[]) {
  return modules.map(module => ({
    ...module,
    code: module.code ? js`${module.code};` : undefined,
  }));
}

describe('extractModules()', () => {
  it('extracts all modules from a html document', () => {
    const document = parse(html`
      <div>before</div>
      <script type="module" src="./foo.js"></script>
      <script type="module" src="/bar.js"></script>
      <div>after</div>
    `);

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/',
      rootDir: '/',
    });
    const htmlWithoutModules = serialize(document);

    assert.equal(inlineModules.length, 0);
    assert.deepEqual(moduleImports, [
      { importPath: `${sep}foo.js`, attributes: [] },
      { importPath: `${sep}bar.js`, attributes: [] },
    ]);
    assert.deepEqual(
      html`${htmlWithoutModules}`,
      html`
        <html>
          <head></head>
          <body>
            <div>before</div>
            <div>after</div>
          </body>
        </html>
      `,
    );
  });

  it('does not touch non module scripts', () => {
    const document = parse(html`
      <div>before</div>
      <script src="./foo.js"></script>
      <script></script>
      <div>after</div>
    `);

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/',
      rootDir: '/',
    });
    const htmlWithoutModules = serialize(document);

    assert.equal(inlineModules.length, 0);
    assert.deepEqual(moduleImports, []);
    assert.deepEqual(
      html`${htmlWithoutModules}`,
      html`
        <html>
          <head></head>
          <body>
            <div>before</div>
            <script src="./foo.js"></script>
            <script></script>
            <div>after</div>
          </body>
        </html>
      `,
    );
  });

  it('resolves imports relative to the root dir', () => {
    const document = parse(html`
      <div>before</div>
      <script type="module" src="./foo.js"></script>
      <script type="module" src="/bar.js"></script>
      <div>after</div>
    `);

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/',
      rootDir: '/base/',
    });
    const htmlWithoutModules = serialize(document);

    assert.equal(inlineModules.length, 0);
    assert.deepEqual(moduleImports, [
      { importPath: `${sep}foo.js`, attributes: [] },
      { importPath: `${sep}base${sep}bar.js`, attributes: [] },
    ]);
    assert.deepEqual(
      html`${htmlWithoutModules}`,
      html`
        <html>
          <head></head>
          <body>
            <div>before</div>
            <div>after</div>
          </body>
        </html>
      `,
    );
  });

  it('resolves relative imports relative to the relative import base', () => {
    const document = parse(html`
      <div>before</div>
      <script type="module" src="./foo.js"></script>
      <script type="module" src="/bar.js"></script>
      <div>after</div>
    `);

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/base-1/base-2/',
      rootDir: '/base-1/',
    });
    const htmlWithoutModules = serialize(document);

    assert.equal(inlineModules.length, 0);
    assert.deepEqual(moduleImports, [
      { importPath: `${sep}base-1${sep}base-2${sep}foo.js`, attributes: [] },
      { importPath: `${sep}base-1${sep}bar.js`, attributes: [] },
    ]);
    assert.deepEqual(
      html`${htmlWithoutModules}`,
      html`
        <html>
          <head></head>
          <body>
            <div>before</div>
            <div>after</div>
          </body>
        </html>
      `,
    );
  });

  it('extracts all inline modules from a html document', () => {
    const document = parse(html`
      <div>before</div>
      <script type="module">
        /* my module 1 */
      </script>
      <script type="module">
        /* my module 2 */
      </script>
      <div>after</div>
    `);

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/',
      rootDir: '/',
    });
    const htmlWithoutModules = serialize(document);

    assert.deepEqual(cleanupInlineModules(inlineModules), [
      {
        importPath: '/inline-module-80efb22c2d1ce27c40eae10611f7680f.js',
        code: js`/* my module 1 */`,
        attributes: [],
      },
      {
        importPath: '/inline-module-b8a73bff59b998da13ce8a6801934f77.js',
        code: js`/* my module 2 */`,
        attributes: [],
      },
    ]);
    assert.deepEqual(moduleImports, []);
    assert.deepEqual(
      html`${htmlWithoutModules}`,
      html`
        <html>
          <head></head>
          <body>
            <div>before</div>
            <div>after</div>
          </body>
        </html>
      `,
    );
  });

  it('prefixes inline module with index.html directory', () => {
    const document = parse(html`
      <div>before</div>
      <script type="module">
        /* my module 1 */
      </script>
      <script type="module">
        /* my module 2 */
      </script>
      <div>after</div>
    `);

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/foo/bar/',
      rootDir: '/',
    });
    const htmlWithoutModules = serialize(document);

    assert.deepEqual(cleanupInlineModules(inlineModules), [
      {
        importPath: '/foo/bar/inline-module-80efb22c2d1ce27c40eae10611f7680f.js',
        code: js`/* my module 1 */`,
        attributes: [],
      },
      {
        importPath: '/foo/bar/inline-module-b8a73bff59b998da13ce8a6801934f77.js',
        code: js`/* my module 2 */`,
        attributes: [],
      },
    ]);
    assert.deepEqual(moduleImports, []);
    assert.deepEqual(
      html`${htmlWithoutModules}`,
      html`
        <html>
          <head></head>
          <body>
            <div>before</div>
            <div>after</div>
          </body>
        </html>
      `,
    );
  });

  it('ignores absolute paths', () => {
    const document = parse(html`
      <div>before</div>
      <script type="module" src="https://www.my-cdn.com/foo.js"></script>
      <script type="module" src="/bar.js"></script>
      <div>after</div>
    `);

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/',
      rootDir: '/',
    });
    const htmlWithoutModules = serialize(document);

    assert.equal(inlineModules.length, 0);
    assert.deepEqual(moduleImports, [{ importPath: `${sep}bar.js`, attributes: [] }]);
    assert.deepEqual(
      html`${htmlWithoutModules}`,
      html`
        <html>
          <head></head>
          <body>
            <div>before</div>
            <script type="module" src="https://www.my-cdn.com/foo.js"></script>
            <div>after</div>
          </body>
        </html>
      `,
    );
  });
});
