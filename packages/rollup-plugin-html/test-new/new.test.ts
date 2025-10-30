import synchronizedPrettier from '@prettier/sync';
import * as prettier from 'prettier';
import { rollup, OutputChunk, OutputOptions, Plugin, RollupBuild } from 'rollup';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import { rollupPluginHTML } from '../src/index.js';

// TODO: test output "fileName" too, like the real output name, not always it's properly checked besides checking the index.html source

// TODO: write tests for 'legacy-html' (this is when for CSS they are not extracted) and 'legacy-html-and-css' separately
// TODO: write a test for 'shortcut icon'

function collapseWhitespaceAll(str: string) {
  return (
    str &&
    str.replace(/[ \n\r\t\f\xA0]+/g, spaces => {
      return spaces === '\t' ? '\t' : spaces.replace(/(^|\xA0+)[^\xA0]+/g, '$1 ');
    })
  );
}

function format(str: string, parser: prettier.BuiltInParserName) {
  return synchronizedPrettier.format(str, { parser, semi: true, singleQuote: true });
}

function merge(strings: TemplateStringsArray, ...values: string[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
}

const extnameToFormatter: Record<string, (str: string) => string> = {
  '.html': (str: string) => format(collapseWhitespaceAll(str), 'html'),
  '.css': (str: string) => format(str, 'css'),
  '.js': (str: string) => format(str, 'typescript'),
  '.json': (str: string) => format(str, 'json'),
  '.svg': (str: string) => format(collapseWhitespaceAll(str), 'html'),
};

function getFormatterFromFilename(name: string): undefined | ((str: string) => string) {
  return extnameToFormatter[path.extname(name)];
}

const html = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.html'](merge(strings, ...values));

const css = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.css'](merge(strings, ...values));

const js = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.js'](merge(strings, ...values));

const svg = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.svg'](merge(strings, ...values));

const outputConfig: OutputOptions = {
  format: 'es',
  dir: 'dist',
};

async function generateTestBundle(build: RollupBuild, outputConfig: OutputOptions) {
  const { output } = await build.generate(outputConfig);
  const chunks: Record<string, string> = {};
  const assets: Record<string, string | Uint8Array> = {};

  for (const file of output) {
    const filename = file.fileName;
    const formatter = getFormatterFromFilename(filename);
    if (file.type === 'chunk') {
      chunks[filename] = formatter ? formatter(file.code) : file.code;
    } else if (file.type === 'asset') {
      let code = file.source;
      if (typeof code !== 'string' && filename.endsWith('.css')) {
        code = Buffer.from(code).toString('utf8');
      }
      if (typeof code === 'string' && formatter) {
        code = formatter(code);
      }
      assets[filename] = code;
    }
  }

  return { output, chunks, assets };
}

function createApp(structure: Record<string, string | Buffer | object>) {
  const timestamp = Date.now();
  const rootDir = path.join(__dirname, `./.tmp/app-${timestamp}`);
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
  Object.keys(structure).forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(fullPath)) {
      const content = structure[filePath];
      const contentForWrite =
        typeof content === 'object' && !(content instanceof Buffer)
          ? JSON.stringify(content)
          : content;
      fs.writeFileSync(fullPath, contentForWrite);
    }
  });
  return rootDir;
}

function cleanApp() {
  const tmpDir = path.join(__dirname, './.tmp');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }
}

describe('rollup-plugin-html', () => {
  afterEach(() => {
    cleanApp();
  });

  it('can build with an input path as input', async () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <head></head>
          <body>
            <script type="module" src="./entrypoint-a.js"></script>
            <script type="module" src="./entrypoint-b.js"></script>
          </body>
        </html>
      `,
      'entrypoint-a.js': js`
        import './modules/module-a.js';
        console.log('entrypoint-a.js');
      `,
      'entrypoint-b.js': js`
        import './modules/module-b.js';
        console.log('entrypoint-b.js');
      `,
      'modules/module-a.js': js`
        import './shared-module.js';
        console.log('module-a.js');
      `,
      'modules/module-b.js': js`
        import './shared-module.js';
        console.log('module-b.js');
      `,
      'modules/shared-module.js': js`
        console.log('shared-module.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: './index.html',
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(3);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(chunks['entrypoint-a.js']).to.include(js`console.log('entrypoint-a.js');`);
    expect(chunks['entrypoint-b.js']).to.include(js`console.log('entrypoint-b.js');`);
    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="./entrypoint-a.js"></script>
          <script type="module" src="./entrypoint-b.js"></script>
        </body>
      </html>
    `);
  });

  it('can build with html file as rollup input', async () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <head></head>
          <body>
            <script type="module" src="./entrypoint-a.js"></script>
            <script type="module" src="./entrypoint-b.js"></script>
          </body>
        </html>
      `,
      'entrypoint-a.js': js`
        import './modules/module-a.js';
        console.log('entrypoint-a.js');
      `,
      'entrypoint-b.js': js`
        import './modules/module-b.js';
        console.log('entrypoint-b.js');
      `,
      'modules/module-a.js': js`
        import './shared-module.js';
        console.log('module-a.js');
      `,
      'modules/module-b.js': js`
        import './shared-module.js';
        console.log('module-b.js');
      `,
      'modules/shared-module.js': js`
        console.log('shared-module.js');
      `,
    });

    const config = {
      input: './index.html',
      plugins: [rollupPluginHTML({ rootDir })],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(3);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(chunks['entrypoint-a.js']).to.include(js`console.log('entrypoint-a.js');`);
    expect(chunks['entrypoint-b.js']).to.include(js`console.log('entrypoint-b.js');`);
    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="./entrypoint-a.js"></script>
          <script type="module" src="./entrypoint-b.js"></script>
        </body>
      </html>
    `);
  });

  it('will retain attributes on script tags', async () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <head></head>
          <body>
            <script type="module" src="./entrypoint-a.js" keep-this-attribute=""></script>
            <script type="module" src="./entrypoint-b.js"></script>
          </body>
        </html>
      `,
      'entrypoint-a.js': js`
        import './modules/module-a.js';
        console.log('entrypoint-a.js');
      `,
      'entrypoint-b.js': js`
        import './modules/module-b.js';
        console.log('entrypoint-b.js');
      `,
      'modules/module-a.js': js`
        import './shared-module.js';
        console.log('module-a.js');
      `,
      'modules/module-b.js': js`
        import './shared-module.js';
        console.log('module-b.js');
      `,
      'modules/shared-module.js': js`
        console.log('shared-module.js');
      `,
    });

    const config = {
      input: './index.html',
      plugins: [rollupPluginHTML({ rootDir })],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(3);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(chunks['entrypoint-a.js']).to.include(js`console.log('entrypoint-a.js');`);
    expect(chunks['entrypoint-b.js']).to.include(js`console.log('entrypoint-b.js');`);
    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="./entrypoint-a.js" keep-this-attribute=""></script>
          <script type="module" src="./entrypoint-b.js"></script>
        </body>
      </html>
    `);
  });

  it('can build with pure html file as rollup input', async () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <head></head>
          <body>
            <h1>hello world</h1>
          </body>
        </html>
      `,
    });

    const config = {
      input: './index.html',
      plugins: [rollupPluginHTML({ rootDir })],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>hello world</h1>
        </body>
      </html>
    `);
  });

  it('can build with multiple pure html inputs', async () => {
    const rootDir = createApp({
      'index1.html': html`
        <html>
          <head></head>
          <body>
            <h1>hello world</h1>
          </body>
        </html>
      `,
      'index2.html': html`
        <html>
          <head></head>
          <body>
            <h1>hey there</h1>
          </body>
        </html>
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: ['./index1.html', './index2.html'],
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets['index1.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>hello world</h1>
        </body>
      </html>
    `);
    expect(assets['index2.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>hey there</h1>
        </body>
      </html>
    `);
  });

  it('can build with html string as input', async () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            name: 'index.html',
            html: `<script type="module" src="./app.js"></script>`,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="./app.js"></script>
        </body>
      </html>
    `);
  });

  it('resolves paths relative to virtual html filename', async () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            name: 'nested/index.html',
            html: `<script type="module" src="../app.js"></script>`,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(assets['nested/index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="../app.js"></script>
        </body>
      </html>
    `);
  });

  it('can build with inline modules', async () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            name: 'index.html',
            html: `<script type="module">import "./app.js";</script>`,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    const hash = '16165cb387fc14ed1fe1749d05f19f7b';

    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="./inline-module-${hash}.js"></script>
        </body>
      </html>
    `);

    expect(chunks[`inline-module-${hash}.js`]).to.include(js`console.log('app.js');`);
  });

  it('resolves inline module imports relative to the HTML file', async () => {
    const rootDir = createApp({
      'nested/index.html': html`
        <html>
          <head></head>
          <body>
            <script type="module">
              import './app.js';
            </script>
          </body>
        </html>
      `,
      'nested/app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: './nested/index.html',
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    const hash = 'b774aefb8bf002b291fd54d27694a34d';
    expect(chunks[`inline-module-${hash}.js`]).to.include(js`console.log('app.js');`);
  });

  it('can build transforming final output', async () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: `<h1>Hello world</h1><script type="module" src="./app.js"></script>`,
          },
          transformHtml(html) {
            return html.replace('Hello world', 'Goodbye world');
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Goodbye world</h1>
          <script type="module" src="./app.js"></script>
        </body>
      </html>
    `);
  });

  it('can build with a public path', async () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: `<script type="module" src="./app.js"></script>`,
          },
          publicPath: '/static/',
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="/static/app.js"></script>
        </body>
      </html>
    `);
  });

  it('can build with a public path with a file in a directory', async () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            name: 'nested/index.html',
            html: `<script type="module" src="../app.js"></script>`,
          },
          publicPath: '/static/',
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(assets['nested/index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="/static/app.js"></script>
        </body>
      </html>
    `);
  });

  it('can build with multiple build outputs', async () => {
    const rootDir = createApp({
      'app.js': js`
        import './modules/module.js';
        console.log('app.js');
      `,
      'modules/module.js': js`
        console.log('module.js');
      `,
    });

    const plugin = rollupPluginHTML({
      rootDir,
      input: {
        html: `<script type="module" src="./app.js"></script>`,
      },
      publicPath: '/static/',
    });

    const config = {
      input: path.join(rootDir, 'app.js'),
      plugins: [plugin],
    };

    const build = await rollup(config);

    const bundleA = generateTestBundle(build, {
      format: 'system',
      dir: 'dist',
      plugins: [plugin.api.addOutput('legacy')],
    });

    const bundleB = generateTestBundle(build, {
      format: 'es',
      dir: 'dist',
      plugins: [plugin.api.addOutput('modern')],
    });

    const { chunks: chunksA, assets: assetsA } = await bundleA;
    const { chunks: chunksB, assets: assetsB } = await bundleB;

    expect(Object.keys(chunksA)).to.have.lengthOf(1);
    expect(Object.keys(assetsA)).to.have.lengthOf(0);
    expect(Object.keys(chunksB)).to.have.lengthOf(1);
    expect(Object.keys(assetsB)).to.have.lengthOf(1);

    expect(chunksA['app.js']).to.include(js`console.log('app.js');`);
    expect(chunksA['app.js']).to.include(js`console.log('module.js');`);
    expect(chunksB['app.js']).to.include(js`console.log('app.js');`);
    expect(chunksB['app.js']).to.include(js`console.log('module.js');`);

    expect(assetsA['index.html']).to.not.exist;
    expect(assetsB['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script>
            System.import('/static/app.js');
          </script>
          <script type="module" src="/static/app.js"></script>
        </body>
      </html>
    `);
  });

  it('can build with index.html as input and an extra html file as output', async () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: `<script type="module" src="./app.js"></script>`,
          },
        }),
        rollupPluginHTML({
          rootDir,
          input: {
            name: 'foo.html',
            html: `<h1>foo.html</h1>`,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(2);
    expect(Object.keys(assets)).to.have.lengthOf(2);

    expect(chunks['app.js']).to.exist;
    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="./app.js"></script>
        </body>
      </html>
    `);
    expect(assets['foo.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>foo.html</h1>
        </body>
      </html>
    `);
  });

  it('can build with multiple html inputs', async () => {
    const rootDir = createApp({
      'entrypoint-a.js': js`
        import './modules/module-a.js';
        console.log('entrypoint-a.js');
      `,
      'entrypoint-b.js': js`
        import './modules/module-b.js';
        console.log('entrypoint-b.js');
        `,
      'entrypoint-c.js': js`
        import './modules/module-c.js';
        console.log('entrypoint-c.js');
      `,
      'modules/module-a.js': js`
        import './shared-module.js';
        console.log('module-a.js');
      `,
      'modules/module-b.js': js`
        import './shared-module.js';
        console.log('module-b.js');
      `,
      'modules/module-c.js': js`
        import './shared-module.js';
        console.log('module-c.js');
      `,
      'modules/shared-module.js': js`
        console.log('shared-module.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: [
            {
              name: 'page-a.html',
              html: `<h1>Page A</h1><script type="module" src="./entrypoint-a.js"></script>`,
            },
            {
              name: 'page-b.html',
              html: `<h1>Page B</h1><script type="module" src="./entrypoint-b.js"></script>`,
            },
            {
              name: 'page-c.html',
              html: `<h1>Page C</h1><script type="module" src="./entrypoint-c.js"></script>`,
            },
          ],
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(4);
    expect(Object.keys(assets)).to.have.lengthOf(3);

    expect(chunks['entrypoint-a.js']).to.exist;
    expect(chunks['entrypoint-b.js']).to.exist;
    expect(chunks['entrypoint-c.js']).to.exist;

    expect(assets['page-a.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Page A</h1>
          <script type="module" src="./entrypoint-a.js"></script>
        </body>
      </html>
    `);
    expect(assets['page-b.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Page B</h1>
          <script type="module" src="./entrypoint-b.js"></script>
        </body>
      </html>
    `);
    expect(assets['page-c.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Page C</h1>
          <script type="module" src="./entrypoint-c.js"></script>
        </body>
      </html>
    `);
  });

  it('can use a glob to build multiple pages', async () => {
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

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: 'pages/**/*.html',
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(4);
    expect(Object.keys(assets)).to.have.lengthOf(3);

    expect(chunks['page-a.js']).to.exist;
    expect(chunks['page-b.js']).to.exist;
    expect(chunks['page-c.js']).to.exist;

    expect(assets['page-a.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <p>page-a.html</p>
          <script type="module" src="./shared.js"></script>
          <script type="module" src="./page-a.js"></script>
        </body>
      </html>
    `);
    expect(assets['page-b.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <p>page-b.html</p>
          <script type="module" src="./shared.js"></script>
          <script type="module" src="./page-b.js"></script>
        </body>
      </html>
    `);
    // TODO: investigate why shared.js is after page-c.js here but before in the others
    expect(assets['page-c.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <p>page-c.html</p>
          <script type="module" src="./page-c.js"></script>
          <script type="module" src="./shared.js"></script>
        </body>
      </html>
    `);
  });

  it('can exclude globs', async () => {
    const rootDir = createApp({
      'exclude/index.html': html`<a href="assets/partial.html"></a>`,
      'exclude/assets/partial.html': html`<blink>I'm a partial!</blink>`,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: 'exclude/**/*.html',
          exclude: '**/partial.html',
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);
  });

  it('creates unique inline script names', async () => {
    const rootDir = createApp({});

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: [
            {
              name: 'nestedA/indexA.html',
              html: `<h1>Page A</h1><script type="module">console.log('A')</script>`,
            },
            {
              name: 'nestedB/indexB.html',
              html: `<h1>Page B</h1><script type="module">console.log('B')</script>`,
            },
            {
              name: 'indexC.html',
              html: `<h1>Page C</h1><script type="module">console.log('C')</script>`,
            },
          ],
        }),
      ],
    };
    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(3);
    expect(Object.keys(assets)).to.have.lengthOf(3);

    expect(chunks['inline-module-d463148d1d5869e52917a3b270db9e72.js']).to.exist;
    expect(chunks['inline-module-b81da853430abdf130bcc7c4d0ade6d9.js']).to.exist;
    expect(chunks['inline-module-170bb2146da66c440259138c7e0fea7e.js']).to.exist;

    expect(assets['nestedA/indexA.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Page A</h1>
          <script type="module" src="../inline-module-d463148d1d5869e52917a3b270db9e72.js"></script>
        </body>
      </html>
    `);
    expect(assets['nestedB/indexB.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Page B</h1>
          <script type="module" src="../inline-module-b81da853430abdf130bcc7c4d0ade6d9.js"></script>
        </body>
      </html>
    `);
    expect(assets['indexC.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Page C</h1>
          <script type="module" src="./inline-module-170bb2146da66c440259138c7e0fea7e.js"></script>
        </body>
      </html>
    `);
  });

  it('deduplicates common modules', async () => {
    const rootDir = createApp({});

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: [
            {
              name: 'a.html',
              html: `<h1>Page A</h1><script type="module">console.log('common')</script>`,
            },
            {
              name: 'b.html',
              html: `<h1>Page B</h1><script type="module">console.log('common')</script>`,
            },
            {
              name: 'c.html',
              html: `<h1>Page C</h1><script type="module">console.log('common')</script>`,
            },
          ],
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(3);

    expect(chunks['inline-module-44281cf3dede62434e0dd368df08902f.js']).to.exist;

    expect(assets['a.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Page A</h1>
          <script type="module" src="./inline-module-44281cf3dede62434e0dd368df08902f.js"></script>
        </body>
      </html>
    `);
    expect(assets['b.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Page B</h1>
          <script type="module" src="./inline-module-44281cf3dede62434e0dd368df08902f.js"></script>
        </body>
      </html>
    `);
    expect(assets['c.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Page C</h1>
          <script type="module" src="./inline-module-44281cf3dede62434e0dd368df08902f.js"></script>
        </body>
      </html>
    `);
  });

  it('outputs the hashed entrypoint name', async () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: `<script type="module" src="./app.js"></script>`,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, {
      ...outputConfig,
      entryFileNames: '[name]-[hash].js',
    });

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    const appChunk = output.find(f =>
      // @ts-ignore
      f.facadeModuleId.endsWith('app.js'),
    ) as OutputChunk;

    // ensure it's actually hashed
    expect(appChunk.fileName).to.not.equal('app.js');

    // get hashed name dynamically
    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="./${appChunk.fileName}"></script>
        </body>
      </html>
    `);
  });

  it('outputs import path relative to the final output html', async () => {
    const rootDir = createApp({
      'app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            name: 'nested/index.html',
            html: '<script type="module" src="../app.js"></script>',
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(assets['nested/index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="../app.js"></script>
        </body>
      </html>
    `);
  });

  it('can change HTML root directory', async () => {
    const rootDir = createApp({
      'different-root/src/app.js': js`
        console.log('app.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir: path.join(rootDir, 'different-root'),
          input: {
            name: 'src/nested/index.html',
            html: '<script type="module" src="../app.js"></script>',
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(assets['src/nested/index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="../../app.js"></script>
        </body>
      </html>
    `);
  });

  it('can get the input with getInputs()', async () => {
    // default filename
    const pluginA = rollupPluginHTML({ input: { html: 'Hello world' } });

    // filename inferred from input filename
    const rootDirB = createApp({
      'my-page.html': html`<script type="module" src="./app.js"></script>`,
      'app.js': js`console.log('app.js');`,
    });
    const pluginB = rollupPluginHTML({
      input: path.join(rootDirB, 'my-page.html'),
    });

    // filename explicitly set
    const rootDirC = createApp({
      'index.html': html`<script type="module" src="./app.js"></script>`,
      'app.js': js`console.log('app.js');`,
    });
    const pluginC = rollupPluginHTML({
      input: {
        name: 'nested/my-other-page.html',
        path: path.join(rootDirC, 'index.html'),
      },
    });

    await rollup({ plugins: [pluginA] });
    await rollup({ plugins: [pluginB] });
    await rollup({ plugins: [pluginC] });

    expect(pluginA.api.getInputs()[0].name).to.equal('index.html');
    expect(pluginB.api.getInputs()[0].name).to.equal('my-page.html');
    expect(pluginC.api.getInputs()[0].name).to.equal('nested/my-other-page.html');
  });

  it('supports other plugins injecting a transform function', async () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <head></head>
          <body>
            <script type="module" src="./entrypoint-a.js"></script>
            <script type="module" src="./entrypoint-b.js"></script>
          </body>
        </html>
      `,
      'entrypoint-a.js': js`
        import './modules/module-a.js';
        console.log('entrypoint-a.js');
      `,
      'entrypoint-b.js': js`
        import './modules/module-b.js';
        console.log('entrypoint-b.js');
      `,
      'modules/module-a.js': js`
        import './shared-module.js';
        console.log('module-a.js');
      `,
      'modules/module-b.js': js`
        import './shared-module.js';
        console.log('module-b.js');
      `,
      'modules/shared-module.js': js`
        console.log('shared-module.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: './index.html',
        }),
        {
          name: 'other-plugin',
          buildStart(options) {
            if (!options.plugins) throw new Error('no plugins');
            const plugin = options.plugins.find(pl => {
              if (pl.name === '@web/rollup-plugin-html') {
                return pl!.api.getInputs()[0].name === 'index.html';
              }
              return false;
            });
            plugin!.api.addHtmlTransformer((html: string) =>
              html.replace('</body>', '<!-- injected --></body>'),
            );
          },
        } as Plugin,
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(3);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(chunks['entrypoint-a.js']).to.include(js`console.log('entrypoint-a.js');`);
    expect(chunks['entrypoint-b.js']).to.include(js`console.log('entrypoint-b.js');`);
    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <script type="module" src="./entrypoint-a.js"></script>
          <script type="module" src="./entrypoint-b.js"></script>
          <!-- injected -->
        </body>
      </html>
    `);
  });

  it('includes referenced assets in the bundle', async () => {
    const rootDir = createApp({
      'image-a.png': 'image-a.png',
      'image-b.png': 'image-b.png',
      'image-c.png': 'image-c.png',
      'image-a.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'image-b.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'styles.css': css`
        :root {
          color: blue;
        }
      `,
      'foo/x.css': css`
        :root {
          color: x;
        }
      `,
      'foo/bar/y.css': css`
        :root {
          color: y;
        }
      `,
      'webmanifest.json': { message: 'hello world' },
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: html`
              <html>
                <head>
                  <link rel="apple-touch-icon" sizes="180x180" href="./image-a.png" />
                  <link rel="icon" type="image/png" sizes="32x32" href="./image-b.png" />
                  <link rel="manifest" href="./webmanifest.json" />
                  <link rel="mask-icon" href="./image-a.svg" color="#3f93ce" />
                  <link rel="stylesheet" href="./styles.css" />
                  <link rel="stylesheet" href="./foo/x.css" />
                  <link rel="stylesheet" href="./foo/bar/y.css" />
                </head>
                <body>
                  <img src="./image-c.png" />
                  <div>
                    <img src="./image-b.svg" />
                  </div>
                </body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(assets).to.have.keys([
      'assets/image-a.png',
      'assets/image-b.png',
      'assets/image-c-C4yLPiIL.png',
      'assets/image-a.svg',
      'assets/image-b-C4stzVZW.svg',
      'assets/styles-CF2Iy5n1.css',
      'assets/x-DDGg8O6h.css',
      'assets/y-DJTrnPH3.css',
      'assets/webmanifest.json',
      'index.html',
    ]);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="apple-touch-icon" sizes="180x180" href="assets/image-a.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="assets/image-b.png" />
          <link rel="manifest" href="assets/webmanifest.json" />
          <link rel="mask-icon" href="assets/image-a.svg" color="#3f93ce" />
          <link rel="stylesheet" href="assets/styles-CF2Iy5n1.css" />
          <link rel="stylesheet" href="assets/x-DDGg8O6h.css" />
          <link rel="stylesheet" href="assets/y-DJTrnPH3.css" />
        </head>
        <body>
          <img src="assets/image-c-C4yLPiIL.png" />
          <div>
            <img src="assets/image-b-C4stzVZW.svg" />
          </div>
        </body>
      </html>
    `);
  });

  it('deduplicates static assets with similar names', async () => {
    const rootDir = createApp({
      'foo.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'x/foo.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: html`
              <html>
                <head>
                  <link rel="icon" type="image/png" sizes="32x32" href="./foo.svg" />
                  <link rel="mask-icon" href="./x/foo.svg" color="#3f93ce" />
                </head>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="icon" type="image/png" sizes="32x32" href="assets/foo.svg" />
          <link rel="mask-icon" href="assets/foo1.svg" color="#3f93ce" />
        </head>
        <body></body>
      </html>
    `);
  });

  // TODO: this will probably go away (or rewrite this test to a test of a filter for which files to hash and which not)
  it('static and hashed asset nodes can reference the same files', async () => {
    const rootDir = createApp({
      'foo.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: html`
              <html>
                <head>
                  <link rel="icon" type="image/png" sizes="32x32" href="./foo.svg" />
                  <img src="./foo.svg" />
                </head>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="icon" type="image/png" sizes="32x32" href="assets/foo.svg" />
        </head>
        <body>
          <img src="assets/foo-BCCvKrTe.svg" />
        </body>
      </html>
    `);
  });

  it('deduplicates common assets', async () => {
    const rootDir = createApp({
      'image-a.png': 'image-a.png',
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: html`
              <html>
                <body>
                  <link rel="stylesheet" href="./image-a.png" />
                  <img src="./image-a.png" />
                  <img src="./image-a.png" />
                </body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <link rel="stylesheet" href="assets/image-a-XOCPHCrV.png" />
          <img src="assets/image-a-XOCPHCrV.png" />
          <img src="assets/image-a-XOCPHCrV.png" />
        </body>
      </html>
    `);
  });

  it('deduplicates common assets across HTML files', async () => {
    const rootDir = createApp({
      'image-a.png': 'image-a.png',
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: [
            {
              name: 'page-a.html',
              html: html`
                <html>
                  <body>
                    <img src="./image-a.png" />
                  </body>
                </html>
              `,
            },
            {
              name: 'page-b.html',
              html: html`
                <html>
                  <body>
                    <link rel="stylesheet" href="./image-a.png" />
                  </body>
                </html>
              `,
            },
            {
              name: 'page-c.html',
              html: html`
                <html>
                  <body>
                    <link rel="stylesheet" href="./image-a.png" />
                    <img src="./image-a.png" />
                  </body>
                </html>
              `,
            },
          ],
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets['page-a.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <img src="assets/image-a-XOCPHCrV.png" />
        </body>
      </html>
    `);

    expect(assets['page-b.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <link rel="stylesheet" href="assets/image-a-XOCPHCrV.png" />
        </body>
      </html>
    `);

    expect(assets['page-c.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <link rel="stylesheet" href="assets/image-a-XOCPHCrV.png" />
          <img src="assets/image-a-XOCPHCrV.png" />
        </body>
      </html>
    `);
  });

  it('can turn off extracting assets', async () => {
    const rootDir = createApp({
      'image-c.png': 'image-c.png',
      'image-b.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'styles.css': css`
        :root {
          color: blue;
        }
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          extractAssets: false,
          rootDir,
          input: {
            html: html`
              <html>
                <body>
                  <img src="./image-c.png" />
                  <link rel="stylesheet" href="./styles.css" />
                  <img src="./image-b.svg" />
                </body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(1);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head></head>
        <body>
          <img src="./image-c.png" />
          <link rel="stylesheet" href="./styles.css" />
          <img src="./image-b.svg" />
        </body>
      </html>
    `);
  });

  it('can inject a CSP meta tag for inline scripts', async () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <head> </head>
          <body>
            <script type="module" src="./entrypoint-a.js"></script>
            <script type="module" src="./entrypoint-b.js"></script>
            <script>
              console.log('foo');
            </script>
            <script>
              console.log('bar');
            </script>
          </body>
        </html>
      `,
      'entrypoint-a.js': js`
        console.log('entrypoint-a.js');
      `,
      'entrypoint-b.js': js`
        console.log('entrypoint-b.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          strictCSPInlineScripts: true,
          rootDir,
          input: './index.html',
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(2);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(chunks['entrypoint-a.js']).to.include(js`console.log('entrypoint-a.js');`);
    expect(chunks['entrypoint-b.js']).to.include(js`console.log('entrypoint-b.js');`);
    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <meta
            http-equiv="Content-Security-Policy"
            content="script-src 'self' 'sha256-i3pLwbgo/1tHMlVCX/8cE1S2t3ZzlhEPeNmM4xk64js=' 'sha256-uUbL3ywlVw8QBfbTFDrWGvD2pgGen1hZoNcjvB62h/w=';"
          />
        </head>
        <body>
          <script>
            console.log('foo');
          </script>
          <script>
            console.log('bar');
          </script>
          <script type="module" src="./entrypoint-a.js"></script>
          <script type="module" src="./entrypoint-b.js"></script>
        </body>
      </html>
    `);
  });

  it('can add to an existing CSP meta tag for inline scripts', async () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <head>
            <meta
              http-equiv="Content-Security-Policy"
              content="default-src 'self'; prefetch-src 'self'; upgrade-insecure-requests; style-src 'self' 'unsafe-inline';"
            />
          </head>
          <body>
            <script type="module" src="./entrypoint-a.js"></script>
            <script type="module" src="./entrypoint-b.js"></script>
            <script>
              console.log('foo');
            </script>
            <script>
              console.log('bar');
            </script>
          </body>
        </html>
      `,
      'entrypoint-a.js': js`
        console.log('entrypoint-a.js');
      `,
      'entrypoint-b.js': js`
        console.log('entrypoint-b.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          strictCSPInlineScripts: true,
          rootDir,
          input: './index.html',
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(2);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(chunks['entrypoint-a.js']).to.include(js`console.log('entrypoint-a.js');`);
    expect(chunks['entrypoint-b.js']).to.include(js`console.log('entrypoint-b.js');`);
    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'self'; prefetch-src 'self'; upgrade-insecure-requests; style-src 'self' 'unsafe-inline'; script-src 'self' 'sha256-i3pLwbgo/1tHMlVCX/8cE1S2t3ZzlhEPeNmM4xk64js=' 'sha256-uUbL3ywlVw8QBfbTFDrWGvD2pgGen1hZoNcjvB62h/w=';"
          />
        </head>
        <body>
          <script>
            console.log('foo');
          </script>
          <script>
            console.log('bar');
          </script>
          <script type="module" src="./entrypoint-a.js"></script>
          <script type="module" src="./entrypoint-b.js"></script>
        </body>
      </html>
    `);
  });

  it('can add to an existing CSP meta tag for inline scripts even if script-src is already there', async () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <head>
            <meta
              http-equiv="Content-Security-Policy"
              content="default-src 'self'; prefetch-src 'self'; upgrade-insecure-requests; style-src 'self' 'unsafe-inline'; script-src 'self';"
            />
          </head>
          <body>
            <script type="module" src="./entrypoint-a.js"></script>
            <script type="module" src="./entrypoint-b.js"></script>
            <script>
              console.log('foo');
            </script>
            <script>
              console.log('bar');
            </script>
          </body>
        </html>
      `,
      'entrypoint-a.js': js`
        console.log('entrypoint-a.js');
      `,
      'entrypoint-b.js': js`
        console.log('entrypoint-b.js');
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          strictCSPInlineScripts: true,
          rootDir,
          input: './index.html',
        }),
      ],
    };

    const build = await rollup(config);
    const { chunks, assets } = await generateTestBundle(build, outputConfig);

    expect(Object.keys(chunks)).to.have.lengthOf(2);
    expect(Object.keys(assets)).to.have.lengthOf(1);

    expect(chunks['entrypoint-a.js']).to.include(js`console.log('entrypoint-a.js');`);
    expect(chunks['entrypoint-b.js']).to.include(js`console.log('entrypoint-b.js');`);
    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'self'; prefetch-src 'self'; upgrade-insecure-requests; style-src 'self' 'unsafe-inline'; script-src 'self' 'sha256-i3pLwbgo/1tHMlVCX/8cE1S2t3ZzlhEPeNmM4xk64js=' 'sha256-uUbL3ywlVw8QBfbTFDrWGvD2pgGen1hZoNcjvB62h/w=';"
          />
        </head>
        <body>
          <script>
            console.log('foo');
          </script>
          <script>
            console.log('bar');
          </script>
          <script type="module" src="./entrypoint-a.js"></script>
          <script type="module" src="./entrypoint-b.js"></script>
        </body>
      </html>
    `);
  });

  it('can inject a service worker registration script if injectServiceWorker and serviceWorkerPath are provided', async () => {
    const rootDir = createApp({
      'index.html': html`
        <html>
          <body>
            <p>inject a service worker into /index.html</p>
          </body>
        </html>
      `,
      'sub-pure-html/index.html': html`
        <html>
          <body>
            <p>inject a service worker into /sub-page/index.html</p>
          </body>
        </html>
      `,
      'sub-with-js/index.html': html`
        <html>
          <body>
            <p>inject a service worker into /sub-page/index.html</p>
            <script type="module" src="./sub-js.js"></script>
          </body>
        </html>
      `,
      'sub-with-js/sub-js.js': js`console.log('sub-with-js');`,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: '**/*.html',
          flattenOutput: false,
          injectServiceWorker: true,
          serviceWorkerPath: path.join(
            path.resolve(outputConfig.dir as string),
            'service-worker.js',
          ),
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    function extractServiceWorkerPath(code: string) {
      const registerOpen = code.indexOf(".register('");
      const registerClose = code.indexOf("')", registerOpen + 11);
      return code.substring(registerOpen + 11, registerClose);
    }

    expect(extractServiceWorkerPath(assets['index.html'] as string)).to.equal('service-worker.js');
    expect(extractServiceWorkerPath(assets['sub-with-js/index.html'] as string)).to.equal(
      '../service-worker.js',
    );
    expect(extractServiceWorkerPath(assets['sub-pure-html/index.html'] as string)).to.equal(
      '../service-worker.js',
    );
  });

  it('does support a absolutePathPrefix to allow for sub folder deployments', async () => {
    const rootDir = createApp({
      'x/foo.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="yellow"/></svg>`,
      'image-b.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'styles.css': css`
        :root {
          color: blue;
        }
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          absolutePathPrefix: '/my-prefix/',
          rootDir,
          input: {
            html: html`
              <html>
                <head>
                  <link rel="stylesheet" href="../styles.css" />
                </head>
                <body>
                  <img src="/my-prefix/x/foo.svg" />
                  <img src="../image-b.svg" />
                </body>
              </html>
            `,
            name: 'x/index.html',
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets['x/index.html']).to.equal(html`
      <html>
        <head>
          <link rel="stylesheet" href="../assets/styles-CF2Iy5n1.css" />
        </head>
        <body>
          <img src="../assets/foo-CxmWeBHm.svg" />
          <img src="../assets/image-b-C4stzVZW.svg" />
        </body>
      </html>
    `);
  });

  it('[new] handles fonts linked from css files', async () => {
    const rootDir = createApp({
      'fonts/font-bold.woff2': 'font-bold',
      'fonts/font-normal.woff2': 'font-normal',
      'styles.css': css`
        @font-face {
          font-family: Font;
          src: url('fonts/font-normal.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: Font;
          src: url('fonts/font-bold.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: html`
              <html>
                <head>
                  <link rel="stylesheet" href="./styles.css" />
                </head>
                <body></body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets).to.have.keys([
      'assets/font-normal-Cht9ZB76.woff2',
      'assets/font-bold-eQjSonqH.woff2',
      'assets/styles-Dhs3ufep.css',
      'index.html',
    ]);

    expect(assets['assets/styles-Dhs3ufep.css']).to.equal(css`
      @font-face {
        font-family: Font;
        src: url('font-normal-Cht9ZB76.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: Font;
        src: url('font-bold-eQjSonqH.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }
    `);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="stylesheet" href="assets/styles-Dhs3ufep.css" />
        </head>
        <body></body>
      </html>
    `);
  });

  it('[legacy] handles fonts linked from css files', async () => {
    const rootDir = createApp({
      'fonts/font-bold.woff2': 'font-bold',
      'fonts/font-normal.woff2': 'font-normal',
      'styles.css': css`
        @font-face {
          font-family: Font;
          src: url('fonts/font-normal.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: Font;
          src: url('fonts/font-bold.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          extractAssets: 'legacy-html-and-css',
          input: {
            html: html`
              <html>
                <head>
                  <link rel="stylesheet" href="./styles.css" />
                </head>
                <body></body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets).to.have.keys([
      'assets/assets/font-normal-Cht9ZB76.woff2',
      'assets/assets/font-bold-eQjSonqH.woff2',
      'assets/styles-BUBaODov.css',
      'index.html',
    ]);

    expect(assets['assets/styles-BUBaODov.css']).to.equal(css`
      @font-face {
        font-family: Font;
        src: url('assets/font-normal-Cht9ZB76.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: Font;
        src: url('assets/font-bold-eQjSonqH.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }
    `);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="stylesheet" href="assets/styles-BUBaODov.css" />
        </head>
        <body></body>
      </html>
    `);
  });

  it('[new] handles fonts linked from css files in node_modules', async () => {
    const rootDir = createApp({
      'node_modules/foo/fonts/font-bold.woff2': 'font-bold',
      'node_modules/foo/fonts/font-normal.woff2': 'font-normal',
      'node_modules/foo/styles.css': css`
        @font-face {
          font-family: Font;
          src: url('fonts/font-normal.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: Font;
          src: url('fonts/font-bold.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: html`
              <html>
                <head>
                  <link rel="stylesheet" href="./node_modules/foo/styles.css" />
                </head>
                <body></body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets).to.have.keys([
      'assets/font-normal-Cht9ZB76.woff2',
      'assets/font-bold-eQjSonqH.woff2',
      'assets/styles-Dhs3ufep.css',
      'index.html',
    ]);

    expect(assets['assets/styles-Dhs3ufep.css']).to.equal(css`
      @font-face {
        font-family: Font;
        src: url('font-normal-Cht9ZB76.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: Font;
        src: url('font-bold-eQjSonqH.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }
    `);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="stylesheet" href="assets/styles-Dhs3ufep.css" />
        </head>
        <body></body>
      </html>
    `);
  });

  it('[legacy] handles fonts linked from css files in node_modules', async () => {
    const rootDir = createApp({
      'node_modules/foo/fonts/font-bold.woff2': 'font-bold',
      'node_modules/foo/fonts/font-normal.woff2': 'font-normal',
      'node_modules/foo/styles.css': css`
        @font-face {
          font-family: Font;
          src: url('fonts/font-normal.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: Font;
          src: url('fonts/font-bold.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          extractAssets: 'legacy-html-and-css',
          input: {
            html: html`
              <html>
                <head>
                  <link rel="stylesheet" href="./node_modules/foo/styles.css" />
                </head>
                <body></body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets).to.have.keys([
      'assets/assets/font-normal-Cht9ZB76.woff2',
      'assets/assets/font-bold-eQjSonqH.woff2',
      'assets/styles-BUBaODov.css',
      'index.html',
    ]);

    expect(assets['assets/styles-BUBaODov.css']).to.equal(css`
      @font-face {
        font-family: Font;
        src: url('assets/font-normal-Cht9ZB76.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: Font;
        src: url('assets/font-bold-eQjSonqH.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }
    `);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="stylesheet" href="assets/styles-BUBaODov.css" />
        </head>
        <body></body>
      </html>
    `);
  });

  it('handles duplicate fonts correctly', async () => {
    const rootDir = createApp({
      'fonts/font-bold.woff2': 'font-bold',
      'fonts/font-normal.woff2': 'font-normal',
      'styles-a.css': css`
        @font-face {
          font-family: Font;
          src: url('fonts/font-normal.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `,
      'styles-b.css': css`
        @font-face {
          font-family: Font;
          src: url('fonts/font-bold.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: html`
              <html>
                <head>
                  <link rel="stylesheet" href="./styles-a.css" />
                  <link rel="stylesheet" href="./styles-b.css" />
                </head>
                <body></body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { output } = await generateTestBundle(build, outputConfig);

    const fonts = output.filter(o => o.name?.endsWith('font-normal.woff2'));
    expect(fonts.length).to.equal(1);
  });

  it('[new] handles images referenced from css', async () => {
    const rootDir = createApp({
      'images/star.avif': 'star.avif',
      'images/star.gif': 'star.gif',
      'images/star.jpeg': 'star.jpeg',
      'images/star.jpg': 'star.jpg',
      'images/star.png': 'star.png',
      'images/star.svg': 'star.svg',
      'images/star.webp': 'star.webp',
      'styles.css': css`
        #a {
          background-image: url('images/star.avif');
        }

        #b {
          background-image: url('images/star.gif');
        }

        #c {
          background-image: url('images/star.jpeg');
        }

        #d {
          background-image: url('images/star.jpg');
        }

        #e {
          background-image: url('images/star.png');
        }

        #f {
          background-image: url('images/star.svg');
        }

        #g {
          background-image: url('images/star.svg#foo');
        }

        #h {
          background-image: url('images/star.webp');
        }
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: html`
              <html>
                <head>
                  <link rel="stylesheet" href="./styles.css" />
                </head>
                <body></body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets).to.have.keys([
      'assets/star-D_LO5feX.avif',
      'assets/star-BKg9qmmf.gif',
      'assets/star-BZWqL7hS.jpeg',
      'assets/star-Df0JryvN.jpg',
      'assets/star-CXig10q7.png',
      'assets/star-CwhgM_z4.svg',
      'assets/star-CKbh5mKn.webp',
      'assets/styles-mywkihBc.css',
      'index.html',
    ]);

    expect(assets['assets/styles-mywkihBc.css']).to.equal(css`
      #a {
        background-image: url('star-D_LO5feX.avif');
      }

      #b {
        background-image: url('star-BKg9qmmf.gif');
      }

      #c {
        background-image: url('star-BZWqL7hS.jpeg');
      }

      #d {
        background-image: url('star-Df0JryvN.jpg');
      }

      #e {
        background-image: url('star-CXig10q7.png');
      }

      #f {
        background-image: url('star-CwhgM_z4.svg');
      }

      #g {
        background-image: url('star-CwhgM_z4.svg#foo');
      }

      #h {
        background-image: url('star-CKbh5mKn.webp');
      }
    `);
  });

  it('[legacy] handles images referenced from css', async () => {
    const rootDir = createApp({
      'images/star.avif': 'star.avif',
      'images/star.gif': 'star.gif',
      'images/star.jpeg': 'star.jpeg',
      'images/star.jpg': 'star.jpg',
      'images/star.png': 'star.png',
      'images/star.svg': 'star.svg',
      'images/star.webp': 'star.webp',
      'styles.css': css`
        #a {
          background-image: url('images/star.avif');
        }

        #b {
          background-image: url('images/star.gif');
        }

        #c {
          background-image: url('images/star.jpeg');
        }

        #d {
          background-image: url('images/star.jpg');
        }

        #e {
          background-image: url('images/star.png');
        }

        #f {
          background-image: url('images/star.svg');
        }

        #g {
          background-image: url('images/star.svg#foo');
        }

        #h {
          background-image: url('images/star.webp');
        }
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          extractAssets: 'legacy-html-and-css',
          input: {
            html: html`
              <html>
                <head>
                  <link rel="stylesheet" href="./styles.css" />
                </head>
                <body></body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets).to.have.keys([
      'assets/assets/star-D_LO5feX.avif',
      'assets/assets/star-BKg9qmmf.gif',
      'assets/assets/star-BZWqL7hS.jpeg',
      'assets/assets/star-Df0JryvN.jpg',
      'assets/assets/star-CXig10q7.png',
      'assets/assets/star-CwhgM_z4.svg',
      'assets/assets/star-CKbh5mKn.webp',
      'assets/styles-Cuqf3qRf.css',
      'index.html',
    ]);

    expect(assets['assets/styles-Cuqf3qRf.css']).to.equal(css`
      #a {
        background-image: url('assets/star-D_LO5feX.avif');
      }

      #b {
        background-image: url('assets/star-BKg9qmmf.gif');
      }

      #c {
        background-image: url('assets/star-BZWqL7hS.jpeg');
      }

      #d {
        background-image: url('assets/star-Df0JryvN.jpg');
      }

      #e {
        background-image: url('assets/star-CXig10q7.png');
      }

      #f {
        background-image: url('assets/star-CwhgM_z4.svg');
      }

      #g {
        background-image: url('assets/star-CwhgM_z4.svg#foo');
      }

      #h {
        background-image: url('assets/star-CKbh5mKn.webp');
      }
    `);
  });

  it('allows to exclude external assets usign a glob pattern', async () => {
    const rootDir = createApp({
      'image-a.png': 'image-a.png',
      'image-b.png': 'image-b.png',
      'image-a.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'image-b.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'styles.css': css`
        #a1 {
          background-image: url('image-a.png');
        }

        #a2 {
          background-image: url('image-a.svg');
        }

        #d1 {
          background-image: url('./image-b.png');
        }

        #d2 {
          background-image: url('./image-b.svg');
        }
      `,
      'foo/x.css': css`
        :root {
          color: x;
        }
      `,
      'foo/bar/y.css': css`
        :root {
          color: y;
        }
      `,
      'webmanifest.json': { message: 'hello world' },
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          externalAssets: ['**/foo/**/*', '*.svg'],
          rootDir,
          input: {
            html: html`
              <html>
                <head>
                  <link rel="apple-touch-icon" sizes="180x180" href="./image-a.png" />
                  <link rel="icon" type="image/png" sizes="32x32" href="image-b.png" />
                  <link rel="manifest" href="./webmanifest.json" />
                  <link rel="mask-icon" href="./image-a.svg" color="#3f93ce" />
                  <link rel="mask-icon" href="image-b.svg" color="#3f93ce" />
                  <link rel="stylesheet" href="./styles.css" />
                  <link rel="stylesheet" href="./foo/x.css" />
                  <link rel="stylesheet" href="foo/bar/y.css" />
                </head>
                <body>
                  <img src="./image-b.png" />
                  <div>
                    <img src="./image-b.svg" />
                  </div>
                </body>
              </html>
            `,
          },
        }),
      ],
    };

    const build = await rollup(config);
    const { assets } = await generateTestBundle(build, outputConfig);

    expect(assets).to.have.keys([
      'assets/image-a-XOCPHCrV.png',
      'assets/image-b-BgQHKcRn.png',
      'assets/image-a.png',
      'assets/image-b.png',
      'assets/styles-Bv-4gk2N.css',
      'assets/webmanifest.json',
      'index.html',
    ]);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="apple-touch-icon" sizes="180x180" href="assets/image-a.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="assets/image-b.png" />
          <link rel="manifest" href="assets/webmanifest.json" />
          <link rel="mask-icon" href="./image-a.svg" color="#3f93ce" />
          <link rel="mask-icon" href="image-b.svg" color="#3f93ce" />
          <link rel="stylesheet" href="assets/styles-Bv-4gk2N.css" />
          <link rel="stylesheet" href="./foo/x.css" />
          <link rel="stylesheet" href="foo/bar/y.css" />
        </head>
        <body>
          <img src="assets/image-b-BgQHKcRn.png" />
          <div>
            <img src="./image-b.svg" />
          </div>
        </body>
      </html>
    `);

    expect(assets['assets/styles-Bv-4gk2N.css']).to.equal(css`
      #a1 {
        background-image: url('image-a-XOCPHCrV.png');
      }

      #a2 {
        background-image: url('image-a.svg');
      }

      #d1 {
        background-image: url('image-b-BgQHKcRn.png');
      }

      #d2 {
        background-image: url('./image-b.svg');
      }
    `);
  });
});
