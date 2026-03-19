import { expect } from 'chai';
import path from 'path';
import { cleanApp, createApp, html, js } from '../../utils.js';

import { getInputData } from '../../../src/input/getInputData.js';
import { InputData } from '../../../src/input/InputData.js';

function cleanupHtml(str: string) {
  return str.replace(/(\r\n|\n|\r| )/gm, '');
}

function cleanupResult(result: InputData[]) {
  return result.map(item => ({
    ...item,
    inlineModules: Array.from(item.inlineModules.entries()),
    html: cleanupHtml(item.html),
  }));
}

describe('getInputData()', () => {
  afterEach(() => {
    cleanApp();
  });

  it('supports setting input as string', () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({ input: 'index.html', rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'index.html',
      },
    ]);
  });

  it('supports setting input as object', () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({ input: { path: 'index.html' }, rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'index.html',
      },
    ]);
  });

  it('supports changing file name', () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({ input: { path: 'index.html', name: 'foo.html' }, rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'foo.html',
      },
    ]);
  });

  it('supports setting multiple inputs', () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'not-index.html': html`
        <html>
          <body>
            <p>not-index.html</p>
          </body>
        </html>
      `,
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({
      input: [{ path: 'index.html' }, { path: 'not-index.html' }],
      rootDir,
    });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'index.html',
      },
      {
        filePath: path.join(rootDir, 'not-index.html'),
        html: '<html><head></head><body><p>not-index.html</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        assets: [],
        name: 'not-index.html',
      },
    ]);
  });

  it('resolves modules relative to HTML file', () => {
    const rootDir = createApp({
      'src/index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'src/app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({ input: 'src/index.html', rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'src/index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'src', 'app.js'), attributes: [] }],
        assets: [],
        name: 'index.html',
      },
    ]);
  });

  it('supports setting input as rollup input string', () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({ rootDir }, 'index.html');
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'index.html',
      },
    ]);
  });

  it('supports setting input as rollup input array', () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({ rootDir }, ['index.html']);
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'index.html',
      },
    ]);
  });

  it('supports setting input as rollup input array', () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'not-index.html': html`
        <html>
          <body>
            <p>not-index.html</p>
          </body>
        </html>
      `,
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({ rootDir }, ['index.html', 'not-index.html']);
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'index.html',
      },
      {
        filePath: path.join(rootDir, 'not-index.html'),
        html: '<html><head></head><body><p>not-index.html</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        assets: [],
        name: 'not-index.html',
      },
    ]);
  });

  it('supports setting input as rollup input object', () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'not-index.html': html`
        <html>
          <body>
            <p>not-index.html</p>
          </body>
        </html>
      `,
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData(
      { rootDir },
      { 'a.html': 'index.html', 'b.html': 'not-index.html' },
    );
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'a.html',
      },
      {
        filePath: path.join(rootDir, 'not-index.html'),
        html: '<html><head></head><body><p>not-index.html</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        assets: [],
        name: 'b.html',
      },
    ]);
  });

  it('plugin input takes presedence over rollup input', () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>Hello world</p>
            <script type="module" src="./app.js"></script>
          </body>
        </html>
      `,
      'not-index.html': html`
        <html>
          <body>
            <p>not-index.html</p>
          </body>
        </html>
      `,
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({ input: 'index.html', rootDir }, 'not-index.html');
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'index.html'),
        html: '<html><head></head><body><p>Helloworld</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'index.html',
      },
    ]);
  });

  it('can set html string as input', () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({
      input: {
        html: html`
          <html>
            <body>
              <p>HTML as string</p>
              <script type="module" src="./app.js"></script>
            </body>
          </html>
        `,
      },
      rootDir,
    });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: undefined,
        html: '<html><head></head><body><p>HTMLasstring</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: 'index.html',
      },
    ]);
  });

  it('can set multiple html strings as input', () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('hello world');
      `,
    });
    const result = getInputData({
      rootDir,
      input: [
        {
          name: '1.html',
          html: html`
            <html>
              <body>
                <p>HTML1</p>
                <script type="module" src="./app.js"></script>
              </body>
            </html>
          `,
        },
        {
          name: '2.html',
          html: html`
            <html>
              <body>
                <p>HTML2</p>
              </body>
            </html>
          `,
        },
      ],
    });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: undefined,
        html: '<html><head></head><body><p>HTML1</p></body></html>',
        inlineModules: [],
        moduleImports: [{ importPath: path.join(rootDir, 'app.js'), attributes: [] }],
        assets: [],
        name: '1.html',
      },
      {
        filePath: undefined,
        html: '<html><head></head><body><p>HTML2</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        assets: [],
        name: '2.html',
      },
    ]);
  });

  it('supports setting input to a glob', () => {
    const rootDir = createApp({
      'pages/page-a.html': html`
        <html>
          <body>
            <p>page-a.html</p>
            <script type="module" src="./page-a.js"></script>
            <script type="module" src="./shared.js"></script>
          </body>
        </html>
      `,
      'pages/page-b.html': html`
        <html>
          <body>
            <p>page-b.html</p>
            <script type="module" src="./page-b.js"></script>
            <script type="module" src="./shared.js"></script>
          </body>
        </html>
      `,
      'pages/page-c.html': html`
        <html>
          <body>
            <p>page-c.html</p>
            <script type="module" src="./page-c.js"></script>
            <script type="module" src="./shared.js"></script>
          </body>
        </html>
      `,
      'pages/page-a.js': js`
        export default 'page a';
      `,
      'pages/page-b.js': js`
        export default 'page b';
      `,
      'pages/page-c.js': js`
        export default 'page c';
      `,
      'pages/shared.js': js`
        export default 'shared';
      `,
    });
    const result = getInputData({ input: 'pages/**/*.html', rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'pages', 'page-c.html'),
        html: '<html><head></head><body><p>page-c.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          { importPath: path.join(rootDir, 'pages', 'page-c.js'), attributes: [] },
          { importPath: path.join(rootDir, 'pages', 'shared.js'), attributes: [] },
        ],
        assets: [],
        name: 'page-c.html',
      },
      {
        filePath: path.join(rootDir, 'pages', 'page-b.html'),
        html: '<html><head></head><body><p>page-b.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          { importPath: path.join(rootDir, 'pages', 'page-b.js'), attributes: [] },
          { importPath: path.join(rootDir, 'pages', 'shared.js'), attributes: [] },
        ],
        assets: [],
        name: 'page-b.html',
      },
      {
        filePath: path.join(rootDir, 'pages', 'page-a.html'),
        html: '<html><head></head><body><p>page-a.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          { importPath: path.join(rootDir, 'pages', 'page-a.js'), attributes: [] },
          { importPath: path.join(rootDir, 'pages', 'shared.js'), attributes: [] },
        ],
        assets: [],
        name: 'page-a.html',
      },
    ]);
  });

  it('supports not flattening output directories', () => {
    const rootDir = createApp({
      'pages/page-a.html': html`
        <html>
          <body>
            <p>page-a.html</p>
            <script type="module" src="./page-a.js"></script>
            <script type="module" src="./shared.js"></script>
          </body>
        </html>
      `,
      'pages/page-b.html': html`
        <html>
          <body>
            <p>page-b.html</p>
            <script type="module" src="./page-b.js"></script>
            <script type="module" src="./shared.js"></script>
          </body>
        </html>
      `,
      'pages/page-c.html': html`
        <html>
          <body>
            <p>page-c.html</p>
            <script type="module" src="./page-c.js"></script>
            <script type="module" src="./shared.js"></script>
          </body>
        </html>
      `,
      'pages/page-a.js': js`
        export default 'page a';
      `,
      'pages/page-b.js': js`
        export default 'page b';
      `,
      'pages/page-c.js': js`
        export default 'page c';
      `,
      'pages/shared.js': js`
        export default 'shared';
      `,
    });
    const result = getInputData({ input: 'pages/**/*.html', flattenOutput: false, rootDir });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: path.join(rootDir, 'pages', 'page-c.html'),
        html: '<html><head></head><body><p>page-c.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          { importPath: path.join(rootDir, 'pages', 'page-c.js'), attributes: [] },
          { importPath: path.join(rootDir, 'pages', 'shared.js'), attributes: [] },
        ],
        assets: [],
        name: `pages${path.sep}page-c.html`,
      },
      {
        filePath: path.join(rootDir, 'pages', 'page-b.html'),
        html: '<html><head></head><body><p>page-b.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          { importPath: path.join(rootDir, 'pages', 'page-b.js'), attributes: [] },
          { importPath: path.join(rootDir, 'pages', 'shared.js'), attributes: [] },
        ],
        assets: [],
        name: `pages${path.sep}page-b.html`,
      },
      {
        filePath: path.join(rootDir, 'pages', 'page-a.html'),
        html: '<html><head></head><body><p>page-a.html</p></body></html>',
        inlineModules: [],
        moduleImports: [
          { importPath: path.join(rootDir, 'pages', 'page-a.js'), attributes: [] },
          { importPath: path.join(rootDir, 'pages', 'shared.js'), attributes: [] },
        ],
        assets: [],
        name: `pages${path.sep}page-a.html`,
      },
    ]);
  });

  it('supports pure HTML files', () => {
    const rootDir = createApp({});
    const result = getInputData({
      rootDir,
      input: {
        html: html`
          <html>
            <body>
              <p>pure HTML</p>
            </body>
          </html>
        `,
      },
    });
    expect(cleanupResult(result)).to.eql([
      {
        filePath: undefined,
        html: '<html><head></head><body><p>pureHTML</p></body></html>',
        inlineModules: [],
        moduleImports: [],
        assets: [],
        name: 'index.html',
      },
    ]);
  });

  it('throws when no files or html is given', () => {
    const rootDir = createApp({});
    expect(() => getInputData({ rootDir })).to.throw();
  });
});
