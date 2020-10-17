import { rollup, OutputChunk, OutputAsset, OutputOptions, Plugin } from 'rollup';
import { expect } from 'chai';
import path from 'path';
import { rollupPluginHTML } from '../src/index';

type Output = (OutputChunk | OutputAsset)[];

function getChunk(output: Output, name: string) {
  return output.find(o => o.fileName === name && o.type === 'chunk') as OutputChunk;
}

function getAsset(output: Output, name: string) {
  return output.find(o => o.fileName === name && o.type === 'asset') as OutputAsset & {
    source: string;
  };
}

const outputConfig: OutputOptions = {
  format: 'es',
  dir: 'dist',
};

function stripNewlines(str: string) {
  return str.replace(/(\r\n|\n|\r)/gm, '');
}

function resolveImport(filePath: string) {
  return `./${path.relative(process.cwd(), require.resolve(filePath)).split(path.sep).join('/')}`;
}

describe('rollup-plugin-html', () => {
  it('can build with an input path as input', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: require.resolve('./fixtures/rollup-plugin-html/index.html'),
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    expect(entryA).to.include("console.log('entrypoint-a.js');");
    expect(entryB).to.include("console.log('entrypoint-b.js');");
    expect(stripNewlines(getAsset(output, 'index.html').source)).to.equal(
      '<html><head></head><body><h1>hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '</body></html>',
    );
  });

  it('can build with html file as rollup input', async () => {
    const config = {
      input: require.resolve('./fixtures/rollup-plugin-html/index.html'),
      plugins: [rollupPluginHTML()],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    expect(entryA).to.include("console.log('entrypoint-a.js');");
    expect(entryB).to.include("console.log('entrypoint-b.js');");
    expect(stripNewlines(getAsset(output, 'index.html').source)).to.equal(
      '<html><head></head><body><h1>hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '</body></html>',
    );
  });

  it('can build with pure html file as rollup input', async () => {
    const config = {
      input: require.resolve('./fixtures/rollup-plugin-html/pure-index.html'),
      plugins: [rollupPluginHTML()],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(stripNewlines(getAsset(output, 'pure-index.html').source)).to.equal(
      '<html><head></head><body><h1>hello world</h1></body></html>',
    );
  });

  it('can build with multiple pure html inputs', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: [
            require.resolve('./fixtures/rollup-plugin-html/pure-index.html'),
            require.resolve('./fixtures/rollup-plugin-html/pure-index2.html'),
          ],
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(stripNewlines(getAsset(output, 'pure-index.html').source)).to.equal(
      '<html><head></head><body><h1>hello world</h1></body></html>',
    );
    expect(stripNewlines(getAsset(output, 'pure-index2.html').source)).to.equal(
      '<html><head></head><body><h1>hey there</h1></body></html>',
    );
  });

  it('can build with html string as input', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            name: 'index.html',
            html:
              '<h1>Hello world</h1>' +
              `<script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-a.js',
              )}"></script>`,
          },
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    expect(stripNewlines(getAsset(output, 'index.html').source)).to.equal(
      '<html><head></head><body><h1>Hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script></body></html>',
    );
  });

  it('can build with inline modules', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            name: 'index.html',
            html:
              '<h1>Hello world</h1>' +
              `<script type="module">import "${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-a.js',
              )}";</script>`,
          },
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    const hash = 'a42119de22d8eabf84df1fa2216d9327';
    const { code: appCode } = getChunk(output, `inline-module-${hash}.js`);
    expect(appCode).to.include("console.log('entrypoint-a.js');");
    expect(stripNewlines(getAsset(output, 'index.html').source)).to.equal(
      '<html><head></head><body><h1>Hello world</h1>' +
        `<script type="module" src="./inline-module-${hash}.js"></script>` +
        '</body></html>',
    );
  });

  it('resolves inline module imports relative to the HTML file', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: require.resolve('./fixtures/rollup-plugin-html/foo/foo.html'),
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    const { code: appCode } = getChunk(output, 'inline-module-a800438e15e36f4770e49fdc32705dd4.js');
    expect(appCode).to.include("console.log('foo');");
  });

  it('can build transforming final output', async () => {
    const config = {
      input: require.resolve('./fixtures/rollup-plugin-html/entrypoint-a.js'),
      plugins: [
        rollupPluginHTML({
          input: {
            html:
              '<h1>Hello world</h1>' +
              `<script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-a.js',
              )}"></script>`,
          },
          transform(html) {
            return html.replace('Hello world', 'Goodbye world');
          },
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    expect(getAsset(output, 'index.html').source).to.equal(
      '<html><head></head><body><h1>Goodbye world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script></body></html>',
    );
  });

  it('can build with a public path', async () => {
    const config = {
      input: require.resolve('./fixtures/rollup-plugin-html/entrypoint-a.js'),
      plugins: [
        rollupPluginHTML({
          input: {
            html:
              '<h1>Hello world</h1>' +
              `<script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-a.js',
              )}"></script>`,
          },
          publicPath: '/static/',
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    expect(getAsset(output, 'index.html').source).to.equal(
      '<html><head></head><body><h1>Hello world</h1>' +
        '<script type="module" src="/static/entrypoint-a.js"></script></body></html>',
    );
  });

  it('can build with a public path with a file in a directory', async () => {
    const config = {
      input: require.resolve('./fixtures/rollup-plugin-html/entrypoint-a.js'),
      plugins: [
        rollupPluginHTML({
          input: {
            name: 'pages/index.html',
            html:
              '<h1>Hello world</h1>' +
              `<script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-a.js',
              )}"></script>`,
          },
          publicPath: '/static/',
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    expect(getAsset(output, 'pages/index.html').source).to.equal(
      '<html><head></head><body><h1>Hello world</h1>' +
        '<script type="module" src="/static/entrypoint-a.js"></script></body></html>',
    );
  });

  it('can build with multiple build outputs', async () => {
    const plugin = rollupPluginHTML({
      input: {
        html:
          '<h1>Hello world</h1>' +
          `<script type="module" src="${resolveImport(
            './fixtures/rollup-plugin-html/entrypoint-a.js',
          )}"></script>`,
      },
      publicPath: '/static/',
    });
    const config = {
      input: require.resolve('./fixtures/rollup-plugin-html/entrypoint-a.js'),
      plugins: [plugin],
    };
    const build = await rollup(config);
    const bundleA = build.generate({
      format: 'system',
      dir: 'dist',
      plugins: [plugin.api.addOutput('legacy')],
    });
    const bundleB = build.generate({
      format: 'es',
      dir: 'dist',
      plugins: [plugin.api.addOutput('modern')],
    });
    const { output: outputA } = await bundleA;
    const { output: outputB } = await bundleB;
    expect(outputA.length).to.equal(1);
    expect(outputB.length).to.equal(2);
    const { code: entrypointA1 } = getChunk(outputA, 'entrypoint-a.js');
    const { code: entrypointA2 } = getChunk(outputB, 'entrypoint-a.js');
    expect(entrypointA1).to.include("console.log('entrypoint-a.js');");
    expect(entrypointA1).to.include("console.log('module-a.js');");
    expect(entrypointA2).to.include("console.log('entrypoint-a.js');");
    expect(entrypointA2).to.include("console.log('module-a.js');");
    expect(getAsset(outputA, 'index.html')).to.not.exist;
    expect(getAsset(outputB, 'index.html').source).to.equal(
      '<html><head></head><body><h1>Hello world</h1>' +
        '<script>System.import("/static/entrypoint-a.js");</script>' +
        '<script type="module" src="/static/entrypoint-a.js"></script></body></html>',
    );
  });

  it('can build with index.html as input and an extra html file as output', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            html:
              '<h1>Hello world</h1>' +
              `<script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-a.js',
              )}"></script>`,
          },
        }),
        rollupPluginHTML({
          input: {
            name: 'foo.html',
            html: '<html><body><h1>foo.html</h1></body></html>',
          },
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(4);
    expect(getChunk(output, 'entrypoint-a.js')).to.exist;
    expect(getAsset(output, 'index.html').source).to.equal(
      '<html><head></head><body><h1>Hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script></body></html>',
    );
    expect(getAsset(output, 'foo.html').source).to.equal(
      '<html><head></head><body><h1>foo.html</h1></body></html>',
    );
  });

  it('can build with multiple html inputs', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: [
            {
              name: 'page-a.html',
              html: `<h1>Page A</h1><script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-a.js',
              )}"></script>`,
            },
            {
              name: 'page-b.html',
              html: `<h1>Page B</h1><script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-b.js',
              )}"></script>`,
            },
            {
              name: 'page-c.html',
              html: `<h1>Page C</h1><script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-c.js',
              )}"></script>`,
            },
          ],
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(7);
    expect(getChunk(output, 'entrypoint-a.js')).to.exist;
    expect(getChunk(output, 'entrypoint-b.js')).to.exist;
    expect(getChunk(output, 'entrypoint-c.js')).to.exist;
    expect(getAsset(output, 'page-a.html').source).to.equal(
      '<html><head></head><body><h1>Page A</h1><script type="module" src="./entrypoint-a.js"></script></body></html>',
    );
    expect(getAsset(output, 'page-b.html').source).to.equal(
      '<html><head></head><body><h1>Page B</h1><script type="module" src="./entrypoint-b.js"></script></body></html>',
    );
    expect(getAsset(output, 'page-c.html').source).to.equal(
      '<html><head></head><body><h1>Page C</h1><script type="module" src="./entrypoint-c.js"></script></body></html>',
    );
  });

  it('can use a glob to build multiple pages', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: 'pages/**/*.html',
          rootDir: path.resolve(__dirname, 'fixtures', 'rollup-plugin-html'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    const pageA = getAsset(output, 'page-a.html').source;
    const pageB = getAsset(output, 'page-b.html').source;
    const pageC = getAsset(output, 'page-c.html').source;
    expect(output.length).to.equal(7);
    expect(getChunk(output, 'page-a.js')).to.exist;
    expect(getChunk(output, 'page-b.js')).to.exist;
    expect(getChunk(output, 'page-c.js')).to.exist;
    expect(pageA).to.include('<p>page-a.html</p>');
    expect(pageA).to.include('<script type="module" src="./page-a.js"></script>');
    expect(pageA).to.include('<script type="module" src="./shared.js"></script>');
    expect(pageB).to.include('<p>page-b.html</p>');
    expect(pageB).to.include('<script type="module" src="./page-b.js"></script>');
    expect(pageB).to.include('<script type="module" src="./shared.js"></script>');
    expect(pageC).to.include('<p>page-c.html</p>');
    expect(pageC).to.include('<script type="module" src="./page-c.js"></script>');
    expect(pageC).to.include('<script type="module" src="./shared.js"></script>');
  });

  it('creates unique inline script names', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: [
            {
              name: 'foo/index.html',
              html: '<h1>Page A</h1><script type="module">console.log("A")</script>',
            },
            {
              name: 'bar/index.html',
              html: '<h1>Page B</h1><script type="module">console.log("B")</script>',
            },
            {
              name: 'x.html',
              html: '<h1>Page C</h1><script type="module">console.log("C")</script>',
            },
          ],
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(6);
    expect(getChunk(output, 'inline-module-a1a4b6a2df76d79f9792d53eef2180a9.js')).to.exist;
    expect(getChunk(output, 'inline-module-de5be8b582edb0591f9b43d8367d2763.js')).to.exist;
    expect(getChunk(output, 'inline-module-7449e02a4386f3b7ce9e0671ad3e9b1e.js')).to.exist;
    expect(getAsset(output, 'foo/index.html').source).to.equal(
      '<html><head></head><body><h1>Page A</h1><script type="module" src="../inline-module-a1a4b6a2df76d79f9792d53eef2180a9.js"></script></body></html>',
    );
    expect(getAsset(output, 'bar/index.html').source).to.equal(
      '<html><head></head><body><h1>Page B</h1><script type="module" src="../inline-module-de5be8b582edb0591f9b43d8367d2763.js"></script></body></html>',
    );
    expect(getAsset(output, 'x.html').source).to.equal(
      '<html><head></head><body><h1>Page C</h1><script type="module" src="./inline-module-7449e02a4386f3b7ce9e0671ad3e9b1e.js"></script></body></html>',
    );
  });

  it('deduplicates common modules', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: [
            {
              name: 'a.html',
              html: '<h1>Page A</h1><script type="module">console.log("A")</script>',
            },
            {
              name: 'b.html',
              html: '<h1>Page B</h1><script type="module">console.log("A")</script>',
            },
            {
              name: 'c.html',
              html: '<h1>Page C</h1><script type="module">console.log("A")</script>',
            },
          ],
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(4);
    expect(getChunk(output, 'inline-module-a1a4b6a2df76d79f9792d53eef2180a9.js')).to.exist;
    expect(getAsset(output, 'a.html').source).to.equal(
      '<html><head></head><body><h1>Page A</h1><script type="module" src="./inline-module-a1a4b6a2df76d79f9792d53eef2180a9.js"></script></body></html>',
    );
    expect(getAsset(output, 'b.html').source).to.equal(
      '<html><head></head><body><h1>Page B</h1><script type="module" src="./inline-module-a1a4b6a2df76d79f9792d53eef2180a9.js"></script></body></html>',
    );
    expect(getAsset(output, 'c.html').source).to.equal(
      '<html><head></head><body><h1>Page C</h1><script type="module" src="./inline-module-a1a4b6a2df76d79f9792d53eef2180a9.js"></script></body></html>',
    );
  });

  it('outputs the hashed entrypoint name', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            html:
              '<h1>Hello world</h1>' +
              `<script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-a.js',
              )}"></script>`,
          },
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate({
      ...outputConfig,
      entryFileNames: '[name]-[hash].js',
    });
    expect(output.length).to.equal(2);
    const entrypoint = output.find(f =>
      // @ts-ignore
      f.facadeModuleId.endsWith('entrypoint-a.js'),
    ) as OutputChunk;
    // ensure it's actually hashed
    expect(entrypoint.fileName).to.not.equal('entrypoint-a.js');
    // get hashed name dynamically
    expect(getAsset(output, 'index.html').source).to.equal(
      `<html><head></head><body><h1>Hello world</h1><script type="module" src="./${entrypoint.fileName}"></script></body></html>`,
    );
  });

  it('outputs import path relative to the final output html', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            name: 'pages/index.html',
            html:
              '<h1>Hello world</h1>' +
              `<script type="module" src="${resolveImport(
                './fixtures/rollup-plugin-html/entrypoint-a.js',
              )}"></script>`,
          },
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    expect(getAsset(output, 'pages/index.html').source).to.equal(
      '<html><head></head><body><h1>Hello world</h1><script type="module" src="../entrypoint-a.js"></script></body></html>',
    );
  });

  it('can get the input with getInputs()', async () => {
    // default filename
    const pluginA = rollupPluginHTML({ input: { html: 'Hello world' } });
    // filename inferred from input filename
    const pluginB = rollupPluginHTML({
      input: require.resolve('./fixtures/rollup-plugin-html/my-page.html'),
    });
    // filename explicitly set
    const pluginC = rollupPluginHTML({
      input: {
        name: 'pages/my-other-page.html',
        path: require.resolve('./fixtures/rollup-plugin-html/index.html'),
      },
    });
    await rollup({
      input: require.resolve('./fixtures/rollup-plugin-html/entrypoint-a.js'),
      plugins: [pluginA],
    });
    await rollup({ plugins: [pluginB] });
    await rollup({ plugins: [pluginC] });
    expect(pluginA.api.getInputs()[0].name).to.equal('index.html');
    expect(pluginB.api.getInputs()[0].name).to.equal('my-page.html');
    expect(pluginC.api.getInputs()[0].name).to.equal('pages/my-other-page.html');
  });

  it('supports other plugins injecting a transform function', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: require.resolve('./fixtures/rollup-plugin-html/index.html'),
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
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    expect(entryA).to.include("console.log('entrypoint-a.js');");
    expect(entryB).to.include("console.log('entrypoint-b.js');");
    expect(stripNewlines(getAsset(output, 'index.html').source)).to.equal(
      '<html><head></head><body><h1>hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '<!-- injected --></body></html>',
    );
  });
});
