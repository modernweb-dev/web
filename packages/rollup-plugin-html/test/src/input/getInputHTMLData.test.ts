import { expect } from 'chai';
import path from 'path';

import { getInputHTMLData } from '../../../src/input/getInputHTMLData';
import { InputHTMLData } from '../../../src/input/InputHTMLData';

const rootDir = path.join(__dirname, '..', '..', 'fixtures', 'basic');

function cleanupHtml(str: string) {
  return str.replace(/(\r\n|\n|\r| )/gm, '');
}

function cleanupResult(result: InputHTMLData[]) {
  return result.map(item => ({
    ...item,
    inlineModules: Array.from(item.inlineModules.entries()),
    html: cleanupHtml(item.html),
  }));
}

describe('getInputHTMLData()', () => {
  it('supports setting input as string', () => {
    const result = getInputHTMLData({ input: 'index.html', rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'index.html',
      },
    ]);
  });

  it('supports setting input as object', () => {
    const result = getInputHTMLData({ input: { path: 'index.html' }, rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'index.html',
      },
    ]);
  });

  it('supports changing file name', () => {
    const result = getInputHTMLData({ input: { path: 'index.html', name: 'foo.html' }, rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'foo.html',
      },
    ]);
  });

  it('supports setting multiple inputs', () => {
    const result = getInputHTMLData({
      input: [{ path: 'index.html' }, { path: 'not-index.html' }],
      rootDir,
    });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'index.html',
      },
      {
        filePath: path.join(rootDir, 'not-index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>not-index.html</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        name: 'not-index.html',
      },
    ]);
  });

  it('resolves modules relative to HTML file', () => {
    const result = getInputHTMLData({ input: 'src/index.html', rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'src/index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Foo</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'src', 'foo.js')],
        name: 'index.html',
      },
    ]);
  });

  it('supports setting input as rollup input string', () => {
    const result = getInputHTMLData({ rootDir }, 'index.html');
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'index.html',
      },
    ]);
  });

  it('supports setting input as rollup input array', () => {
    const result = getInputHTMLData({ rootDir }, ['index.html']);
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'index.html',
      },
    ]);
  });

  it('supports setting input as rollup input array', () => {
    const result = getInputHTMLData({ rootDir }, ['index.html', 'not-index.html']);
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'index.html',
      },
      {
        filePath: path.join(rootDir, 'not-index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>not-index.html</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        name: 'not-index.html',
      },
    ]);
  });

  it('supports setting input as rollup input object', () => {
    const result = getInputHTMLData(
      { rootDir },
      { 'a.html': 'index.html', 'b.html': 'not-index.html' },
    );
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'a.html',
      },
      {
        filePath: path.join(rootDir, 'not-index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>not-index.html</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        name: 'b.html',
      },
    ]);
  });

  it('plugin input takes presedence over rollup input', () => {
    const result = getInputHTMLData({ input: 'index.html', rootDir }, 'not-index.html');
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'index.html',
      },
    ]);
  });

  it('can set html string as input', () => {
    const html = `
      <html>
        <body>
          <p>HTML as string</p>
          <script type="module" src="./app.js"></script>
        </body>
      </html>
    `;
    const result = getInputHTMLData({ input: { html }, rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: undefined,
        html: '<html><head></head><body><p>HTMLasstring</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: 'index.html',
      },
    ]);
  });

  it('can set multiple html strings as input', () => {
    const html1 = `
      <html>
        <body>
          <p>HTML1</p>
          <script type="module" src="./app.js"></script>
        </body>
      </html>
    `;
    const html2 = `
    <html>
      <body>
        <p>HTML2</p>
      </body>
    </html>
  `;
    const result = getInputHTMLData({
      input: [
        { html: html1, name: '1.html' },
        { html: html2, name: '2.html' },
      ],
      rootDir,
    });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: undefined,
        html: '<html><head></head><body><p>HTML1</p></body></html>',
        inlineModules: [],
        moduleImports: [path.join(rootDir, 'app.js')],
        name: '1.html',
      },
      {
        filePath: undefined,
        html: '<html><head></head><body><p>HTML2</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        name: '2.html',
      },
    ]);
  });

  it('supports setting input to a glob', () => {
    const result = getInputHTMLData({ input: 'pages/**/*.html', rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'pages', 'page-a.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>page-a.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          path.join(rootDir, 'pages', 'page-a.js'),
          path.join(rootDir, 'pages', 'shared.js'),
        ],
        name: 'page-a.html',
      },
      {
        filePath: path.join(rootDir, 'pages', 'page-b.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>page-b.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          path.join(rootDir, 'pages', 'page-b.js'),
          path.join(rootDir, 'pages', 'shared.js'),
        ],
        name: 'page-b.html',
      },
      {
        filePath: path.join(rootDir, 'pages', 'page-c.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>page-c.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          path.join(rootDir, 'pages', 'page-c.js'),
          path.join(rootDir, 'pages', 'shared.js'),
        ],
        name: 'page-c.html',
      },
    ]);
  });

  it('supports not flattening output directories', () => {
    const result = getInputHTMLData({ input: 'pages/**/*.html', flattenOutput: false, rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'pages', 'page-a.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>page-a.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          path.join(rootDir, 'pages', 'page-a.js'),
          path.join(rootDir, 'pages', 'shared.js'),
        ],
        name: `pages${path.sep}page-a.html`,
      },
      {
        filePath: path.join(rootDir, 'pages', 'page-b.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>page-b.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          path.join(rootDir, 'pages', 'page-b.js'),
          path.join(rootDir, 'pages', 'shared.js'),
        ],
        name: `pages${path.sep}page-b.html`,
      },
      {
        filePath: path.join(rootDir, 'pages', 'page-c.html').split(path.sep).join('/'),
        html: '<html><head></head><body><p>page-c.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          path.join(rootDir, 'pages', 'page-c.js'),
          path.join(rootDir, 'pages', 'shared.js'),
        ],

        name: `pages${path.sep}page-c.html`,
      },
    ]);
  });

  it('supports pure HTML files', () => {
    const html = `
      <html>
        <body>
          <p>pure HTML</p>
        </body>
      </html>
    `;
    const result = getInputHTMLData({ input: { html }, rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: undefined,
        html: '<html><head></head><body><p>pureHTML</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        name: 'index.html',
      },
    ]);
  });

  it('throws when no files or html is given', () => {
    expect(() => getInputHTMLData({ rootDir })).to.throw();
  });
});
