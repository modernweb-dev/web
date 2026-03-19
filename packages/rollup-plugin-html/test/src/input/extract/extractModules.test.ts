import path from 'path';
import { parse, serialize } from 'parse5';
import { expect } from 'chai';
import { html, js } from '../../../utils.js';

import { extractModules } from '../../../../src/input/extract/extractModules.js';
import { ScriptModuleTag } from '../../../../src/RollupPluginHTMLOptions.js';

const { sep } = path;

function cleanupInlineModules(modules: ScriptModuleTag[]) {
  return modules.map(module => ({
    ...module,
    code: module.code ? js`${module.code}` : undefined,
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

    expect(inlineModules.length).to.equal(0);
    expect(moduleImports).to.eql([
      { importPath: `${sep}foo.js`, attributes: [] },
      { importPath: `${sep}bar.js`, attributes: [] },
    ]);
    expect(html`${htmlWithoutModules}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <div>before</div>
          <div>after</div>
        </body>
      </html>
    `);
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

    expect(inlineModules.length).to.equal(0);
    expect(moduleImports).to.eql([]);
    expect(html`${htmlWithoutModules}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <div>before</div>
          <script src="./foo.js"></script>
          <script></script>
          <div>after</div>
        </body>
      </html>
    `);
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

    expect(inlineModules.length).to.equal(0);
    expect(moduleImports).to.eql([
      { importPath: `${sep}foo.js`, attributes: [] },
      { importPath: `${sep}base${sep}bar.js`, attributes: [] },
    ]);
    expect(html`${htmlWithoutModules}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <div>before</div>
          <div>after</div>
        </body>
      </html>
    `);
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

    expect(inlineModules.length).to.equal(0);
    expect(moduleImports).to.eql([
      { importPath: `${sep}base-1${sep}base-2${sep}foo.js`, attributes: [] },
      { importPath: `${sep}base-1${sep}bar.js`, attributes: [] },
    ]);
    expect(html`${htmlWithoutModules}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <div>before</div>
          <div>after</div>
        </body>
      </html>
    `);
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

    expect(cleanupInlineModules(inlineModules)).to.eql([
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
    expect(moduleImports).to.eql([]);
    expect(html`${htmlWithoutModules}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <div>before</div>
          <div>after</div>
        </body>
      </html>
    `);
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

    expect(cleanupInlineModules(inlineModules)).to.eql([
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
    expect(moduleImports).to.eql([]);
    expect(html`${htmlWithoutModules}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <div>before</div>
          <div>after</div>
        </body>
      </html>
    `);
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

    expect(inlineModules.length).to.equal(0);
    expect(moduleImports).to.eql([{ importPath: `${sep}bar.js`, attributes: [] }]);
    expect(html`${htmlWithoutModules}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <div>before</div>
          <script type="module" src="https://www.my-cdn.com/foo.js"></script>
          <div>after</div>
        </body>
      </html>
    `);
  });
});
