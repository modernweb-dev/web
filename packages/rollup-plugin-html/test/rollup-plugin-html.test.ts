import { rollup, OutputChunk, OutputAsset, OutputOptions, Plugin } from 'rollup';
import { expect } from 'chai';
import path from 'path';
import { rollupPluginHTML } from '../src/index.js';

type Output = (OutputChunk | OutputAsset)[];

function getChunk(output: Output, name: string) {
  return output.find(o => o.fileName === name && o.type === 'chunk') as OutputChunk;
}

function getAsset(output: Output, name: string) {
  return output.find(o => o.name === name && o.type === 'asset') as OutputAsset & {
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

const rootDir = path.join(__dirname, 'fixtures', 'rollup-plugin-html');

describe('rollup-plugin-html', () => {
  it('can build with an input path as input', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: require.resolve('./fixtures/rollup-plugin-html/index.html'),
          rootDir,
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
      plugins: [rollupPluginHTML({ rootDir })],
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

  it('will retain attributes on script tags', async () => {
    const config = {
      input: require.resolve('./fixtures/rollup-plugin-html/retain-attributes.html'),
      plugins: [rollupPluginHTML({ rootDir })],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    expect(entryA).to.include("console.log('entrypoint-a.js');");
    expect(entryB).to.include("console.log('entrypoint-b.js');");
    expect(stripNewlines(getAsset(output, 'retain-attributes.html').source)).to.equal(
      '<html><head></head><body><h1>hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js" keep-this-attribute=""></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '</body></html>',
    );
  });

  it('can build with pure html file as rollup input', async () => {
    const config = {
      input: require.resolve('./fixtures/rollup-plugin-html/pure-index.html'),
      plugins: [rollupPluginHTML({ rootDir })],
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
          rootDir,
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
            html: '<h1>Hello world</h1><script type="module" src="./entrypoint-a.js"></script>',
          },
          rootDir,
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

  it('resolves paths relative to virtual html filename', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            name: 'pages/index.html',
            html: '<h1>Hello world</h1><script type="module" src="../entrypoint-a.js"></script>',
          },
          rootDir,
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    expect(stripNewlines(getAsset(output, 'pages/index.html').source)).to.equal(
      '<html><head></head><body><h1>Hello world</h1>' +
        '<script type="module" src="../entrypoint-a.js"></script></body></html>',
    );
  });

  it('can build with inline modules', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            name: 'index.html',
            html: '<h1>Hello world</h1><script type="module">import "./entrypoint-a.js";</script>',
          },
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    const hash = '5ec680a4efbb48ae254268ab1defe610';
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
          rootDir,
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    const { code: appCode } = getChunk(output, 'inline-module-1b13383486c70d87f4e2585ff87b147c.js');
    expect(appCode).to.include("console.log('foo');");
  });

  it('can build transforming final output', async () => {
    const config = {
      input: require.resolve('./fixtures/rollup-plugin-html/entrypoint-a.js'),
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html: '<h1>Hello world</h1><script type="module" src="./entrypoint-a.js"></script>',
          },
          transformHtml(html) {
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
          rootDir,
          input: {
            html: '<h1>Hello world</h1><script type="module" src="./entrypoint-a.js"></script>',
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
          rootDir,
          input: {
            name: 'pages/index.html',
            html: '<h1>Hello world</h1><script type="module" src="../entrypoint-a.js"></script>',
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
      rootDir,
      input: {
        html: '<h1>Hello world</h1><script type="module" src="./entrypoint-a.js"></script>',
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
          rootDir,
          input: {
            html: '<h1>Hello world</h1><script type="module" src="./entrypoint-a.js"></script>',
          },
        }),
        rollupPluginHTML({
          rootDir,
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
          rootDir,
          input: 'pages/**/*.html',
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

  it('can exclude globs', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: 'exclude/**/*.html',
          exclude: '**/partial.html',
          rootDir,
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
  });

  it('creates unique inline script names', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
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
    expect(getChunk(output, 'inline-module-b8667c926d8a16ee8b4499492c1726ed.js')).to.exist;
    expect(getChunk(output, 'inline-module-c91911481b66e7483731d4de5df616a6.js')).to.exist;
    expect(getChunk(output, 'inline-module-fbf0242ebea027b7392472c19328791d.js')).to.exist;
    expect(getAsset(output, 'foo/index.html').source).to.equal(
      '<html><head></head><body><h1>Page A</h1><script type="module" src="../inline-module-b8667c926d8a16ee8b4499492c1726ed.js"></script></body></html>',
    );
    expect(getAsset(output, 'bar/index.html').source).to.equal(
      '<html><head></head><body><h1>Page B</h1><script type="module" src="../inline-module-c91911481b66e7483731d4de5df616a6.js"></script></body></html>',
    );
    expect(getAsset(output, 'x.html').source).to.equal(
      '<html><head></head><body><h1>Page C</h1><script type="module" src="./inline-module-fbf0242ebea027b7392472c19328791d.js"></script></body></html>',
    );
  });

  it('deduplicates common modules', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
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
    expect(getChunk(output, 'inline-module-b8667c926d8a16ee8b4499492c1726ed.js')).to.exist;
    expect(getAsset(output, 'a.html').source).to.equal(
      '<html><head></head><body><h1>Page A</h1><script type="module" src="./inline-module-b8667c926d8a16ee8b4499492c1726ed.js"></script></body></html>',
    );
    expect(getAsset(output, 'b.html').source).to.equal(
      '<html><head></head><body><h1>Page B</h1><script type="module" src="./inline-module-b8667c926d8a16ee8b4499492c1726ed.js"></script></body></html>',
    );
    expect(getAsset(output, 'c.html').source).to.equal(
      '<html><head></head><body><h1>Page C</h1><script type="module" src="./inline-module-b8667c926d8a16ee8b4499492c1726ed.js"></script></body></html>',
    );
  });

  it('outputs the hashed entrypoint name', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: {
            html:
              '<h1>Hello world</h1>' + `<script type="module" src="./entrypoint-a.js"></script>`,
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
          rootDir,
          input: {
            name: 'pages/index.html',
            html: '<h1>Hello world</h1><script type="module" src="../entrypoint-a.js"></script>',
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

  it('can change HTML root directory', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir: path.join(__dirname, 'fixtures'),
          input: {
            name: 'rollup-plugin-html/pages/index.html',
            html: '<h1>Hello world</h1><script type="module" src="../entrypoint-a.js"></script>',
          },
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(2);
    expect(getAsset(output, 'rollup-plugin-html/pages/index.html').source).to.equal(
      '<html><head></head><body><h1>Hello world</h1><script type="module" src="../../entrypoint-a.js"></script></body></html>',
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
          rootDir,
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

  it('includes referenced assets in the bundle', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            html: `<html>
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
</html>`,
          },
          rootDir: path.join(__dirname, 'fixtures', 'assets'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    expect(output.length).to.equal(11);
    const expectedAssets = [
      'image-c.png',
      'webmanifest.json',
      'image-a.svg',
      'styles.css',
      'x.css',
      'y.css',
      'image-b.svg',
    ];

    for (const name of expectedAssets) {
      const asset = getAsset(output, name);
      expect(asset).to.exist;
      expect(asset.source).to.exist;
    }

    const outputHtml = getAsset(output, 'index.html').source;
    expect(outputHtml).to.include(
      '<link rel="apple-touch-icon" sizes="180x180" href="assets/image-a.png">',
    );
    expect(outputHtml).to.include(
      '<link rel="icon" type="image/png" sizes="32x32" href="assets/image-b.png">',
    );
    expect(outputHtml).to.include('<link rel="manifest" href="assets/webmanifest.json">');
    expect(outputHtml).to.include(
      '<link rel="mask-icon" href="assets/image-a.svg" color="#3f93ce">',
    );
    expect(outputHtml).to.include('<link rel="stylesheet" href="assets/styles-hdiMuZ9V.css">');
    expect(outputHtml).to.include('<link rel="stylesheet" href="assets/x-wxoPDuod.css">');
    expect(outputHtml).to.include('<link rel="stylesheet" href="assets/y-yU65zx9z.css">');
    expect(outputHtml).to.include('<img src="assets/image-c-Mr5Lb2jQ.png">');
    expect(outputHtml).to.include('<img src="assets/image-b-yrDWczn5.svg">');
  });

  it('deduplicates static assets with similar names', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            html: `<html>
<head>
<link rel="icon" type="image/png" sizes="32x32" href="./foo.svg" />
<link rel="mask-icon" href="./x/foo.svg" color="#3f93ce" />
</head>
</html>`,
          },
          rootDir: path.join(__dirname, 'fixtures', 'assets'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(stripNewlines(getAsset(output, 'index.html').source)).to.equal(
      '<html><head>' +
        '<link rel="icon" type="image/png" sizes="32x32" href="assets/foo.svg">' +
        '<link rel="mask-icon" href="assets/foo1.svg" color="#3f93ce">' +
        '</head><body></body></html>',
    );
  });

  it('static and hashed asset nodes can reference the same files', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            html: `<html>
<head>
<link rel="icon" type="image/png" sizes="32x32" href="./foo.svg">
<img src="./foo.svg">
</head>
</html>`,
          },
          rootDir: path.join(__dirname, 'fixtures', 'assets'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(stripNewlines(getAsset(output, 'index.html').source)).to.equal(
      '<html><head><link rel="icon" type="image/png" sizes="32x32" href="assets/foo.svg"></head>' +
        '<body><img src="assets/foo-WjgrfMGT.svg"></body></html>',
    );
  });

  it('deduplicates common assets', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            html: `<html>
<body>
<link rel="stylesheet" href="./image-a.png">
<img src="./image-a.png">
<img src="./image-a.png">
</body>
</html>`,
          },
          rootDir: path.join(__dirname, 'fixtures', 'assets'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(stripNewlines(getAsset(output, 'index.html').source)).to.equal(
      '<html><head></head><body>' +
        '<link rel="stylesheet" href="assets/image-a-Mr5Lb2jQ.png">' +
        '<img src="assets/image-a-Mr5Lb2jQ.png">' +
        '<img src="assets/image-a-Mr5Lb2jQ.png">' +
        '</body></html>',
    );
  });

  it('deduplicates common assets across HTML files', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: [
            {
              name: 'page-a.html',
              html: `<html>
  <body>
  <img src="./image-a.png">
  </body>
  </html>`,
            },
            {
              name: 'page-b.html',
              html: `<html>
  <body>
  <link rel="stylesheet" href="./image-a.png">
  </body>
  </html>`,
            },
            {
              name: 'page-c.html',
              html: `<html>
  <body>
  <link rel="stylesheet" href="./image-a.png">
  <img src="./image-a.png">
  </body>
  </html>`,
            },
          ],
          rootDir: path.join(__dirname, 'fixtures', 'assets'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(stripNewlines(getAsset(output, 'page-a.html').source)).to.equal(
      '<html><head></head><body>' +
        '  <img src="assets/image-a-Mr5Lb2jQ.png">' +
        '    </body></html>',
    );

    expect(stripNewlines(getAsset(output, 'page-b.html').source)).to.equal(
      '<html><head></head><body>' +
        '  <link rel="stylesheet" href="assets/image-a-Mr5Lb2jQ.png">' +
        '    </body></html>',
    );

    expect(stripNewlines(getAsset(output, 'page-c.html').source)).to.equal(
      '<html><head></head><body>' +
        '  <link rel="stylesheet" href="assets/image-a-Mr5Lb2jQ.png">' +
        '  <img src="assets/image-a-Mr5Lb2jQ.png">' +
        '    </body></html>',
    );
  });

  it('can turn off extracting assets', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          extractAssets: false,
          input: {
            html: `<html>
<body>
<img src="./image-c.png" />
<link rel="stylesheet" href="./styles.css" />
<img src="./image-b.svg" />
</body>
</html>`,
          },
          rootDir: path.join(__dirname, 'fixtures', 'assets'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(2);
    expect(stripNewlines(getAsset(output, 'index.html').source)).to.equal(
      '<html><head></head><body><img src="./image-c.png"><link rel="stylesheet" href="./styles.css"><img src="./image-b.svg"></body></html>',
    );
  });

  it('can inject a CSP meta tag for inline scripts', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: require.resolve('./fixtures/rollup-plugin-html/csp-page-a.html'),
          rootDir,
          strictCSPInlineScripts: true,
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
    expect(stripNewlines(getAsset(output, 'csp-page-a.html').source)).to.equal(
      '<html><head>' +
        "<meta http-equiv=\"Content-Security-Policy\" content=\"script-src 'self' 'sha256-k0fj3IHUtZNziFbz6LL40uxkFlr28beNcMKKtp5+EwE=' 'sha256-UJadfRwzUCb1ajAJFfAPl8NTvtyiHtltKG/12veER70=';\">" +
        '</head><body><h1>hello world</h1>' +
        "<script>console.log('foo');</script>" +
        "<script>console.log('bar');</script>" +
        '<script type="module" src="./entrypoint-a.js"></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '</body></html>',
    );
  });

  it('can add to an existing CSP meta tag for inline scripts', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: require.resolve('./fixtures/rollup-plugin-html/csp-page-b.html'),
          rootDir,
          strictCSPInlineScripts: true,
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
    expect(stripNewlines(getAsset(output, 'csp-page-b.html').source)).to.equal(
      '<html><head>' +
        "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; prefetch-src 'self'; upgrade-insecure-requests; style-src 'self' 'unsafe-inline'; script-src 'self' 'sha256-k0fj3IHUtZNziFbz6LL40uxkFlr28beNcMKKtp5+EwE=' 'sha256-UJadfRwzUCb1ajAJFfAPl8NTvtyiHtltKG/12veER70=';\">" +
        '</head><body><h1>hello world</h1>' +
        "<script>console.log('foo');</script>" +
        "<script>console.log('bar');</script>" +
        '<script type="module" src="./entrypoint-a.js"></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '</body></html>',
    );
  });

  it('can add to an existing CSP meta tag for inline scripts even if script-src is already there', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: require.resolve('./fixtures/rollup-plugin-html/csp-page-c.html'),
          rootDir,
          strictCSPInlineScripts: true,
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
    expect(stripNewlines(getAsset(output, 'csp-page-c.html').source)).to.equal(
      '<html><head>' +
        "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; prefetch-src 'self'; upgrade-insecure-requests; style-src 'self' 'unsafe-inline'; script-src 'self' 'sha256-k0fj3IHUtZNziFbz6LL40uxkFlr28beNcMKKtp5+EwE=' 'sha256-UJadfRwzUCb1ajAJFfAPl8NTvtyiHtltKG/12veER70=';\">" +
        '</head><body><h1>hello world</h1>' +
        "<script>console.log('foo');</script>" +
        "<script>console.log('bar');</script>" +
        '<script type="module" src="./entrypoint-a.js"></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '</body></html>',
    );
  });

  it('can inject a service worker registration script if injectServiceWorker and serviceWorkerPath are provided', async () => {
    const serviceWorkerPath = path.join(
      // @ts-ignore
      path.resolve(outputConfig.dir),
      'service-worker.js',
    );

    const config = {
      plugins: [
        rollupPluginHTML({
          input: '**/*.html',
          rootDir: path.join(__dirname, 'fixtures', 'inject-service-worker'),
          flattenOutput: false,
          injectServiceWorker: true,
          serviceWorkerPath,
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    function extractServiceWorkerPath(src: string) {
      const registerOpen = src.indexOf(".register('");
      const registerClose = src.indexOf("')", registerOpen + 11);
      return src.substring(registerOpen + 11, registerClose);
    }

    expect(extractServiceWorkerPath(getAsset(output, 'index.html').source)).to.equal(
      'service-worker.js',
    );
    expect(
      extractServiceWorkerPath(getAsset(output, path.join('sub-with-js', 'index.html')).source),
    ).to.equal(`../service-worker.js`);
    expect(
      extractServiceWorkerPath(getAsset(output, path.join('sub-pure-html', 'index.html')).source),
    ).to.equal(`../service-worker.js`);
  });

  it('does support a absolutePathPrefix to allow for sub folder deployments', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            html: `<html>
<body>
<img src="/my-prefix/x/foo.svg" />
<link rel="stylesheet" href="../styles.css" />
<img src="../image-b.svg" />
</body>
</html>`,
            name: 'x/index.html',
          },
          rootDir: path.join(__dirname, 'fixtures', 'assets'),
          absolutePathPrefix: '/my-prefix/',
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(stripNewlines(getAsset(output, 'x/index.html').source)).to.equal(
      [
        '<html><head></head><body>',
        '<img src="../assets/foo-ACZ5M5Wv.svg">',
        '<link rel="stylesheet" href="../assets/styles-hdiMuZ9V.css">',
        '<img src="../assets/image-b-yrDWczn5.svg">',
        '</body></html>',
      ].join(''),
    );
  });

  it('handles fonts linked from css files', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          bundleAssetsFromCss: true,
          input: {
            html: `
              <html>
                <head>
                  <link rel="stylesheet" href="./styles-with-fonts.css" />
                </head>
                <body>
                </body>
              </html>
            `,
          },
          rootDir: path.join(__dirname, 'fixtures', 'resolves-assets-in-styles'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    const fontNormal = output.find(o => o.name?.endsWith('font-normal.woff2'));
    const fontBold = output.find(o => o.name?.endsWith('font-normal.woff2'));
    const style = output.find(o => o.name?.endsWith('styles-with-fonts.css'));
    // It has emitted the font
    expect(fontBold).to.exist;
    expect(fontNormal).to.exist;
    // e.g. "font-normal-f0mNRiTD.woff2"
    // eslint-disable-next-line no-useless-escape
    const regex = /assets[\/\\]font-normal-\w+\.woff2/;
    // It outputs the font to the assets folder
    expect(regex.test(fontNormal!.fileName)).to.equal(true);

    // The source of the style includes the font
    const source = (style as OutputAsset)?.source.toString();
    expect(source.includes(fontNormal!.fileName));
  });

  it('handles fonts linked from css files in node_modules', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          bundleAssetsFromCss: true,
          input: {
            html: `
              <html>
                <head>
                  <link rel="stylesheet" href="./node_modules/foo/node_modules-styles-with-fonts.css" />
                </head>
                <body>
                </body>
              </html>
            `,
          },
          rootDir: path.join(__dirname, 'fixtures', 'resolves-assets-in-styles-node-modules'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    const font = output.find(o => o.name?.endsWith('font-normal.woff2'));
    const style = output.find(o => o.name?.endsWith('node_modules-styles-with-fonts.css'));

    // It has emitted the font
    expect(font).to.exist;
    // e.g. "font-normal-f0mNRiTD.woff2"
    // eslint-disable-next-line no-useless-escape
    const regex = /assets[\/\\]font-normal-\w+\.woff2/;
    // It outputs the font to the assets folder
    expect(regex.test(font!.fileName)).to.equal(true);

    // The source of the style includes the font
    const source = (style as OutputAsset)?.source.toString();
    expect(source.includes(font!.fileName));
  });

  it('handles duplicate fonts correctly', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          bundleAssetsFromCss: true,
          input: {
            html: `
              <html>
                <head>
                  <link rel="stylesheet" href="./styles-a.css" />
                  <link rel="stylesheet" href="./styles-b.css" />
                </head>
                <body>
                </body>
              </html>
            `,
          },
          rootDir: path.join(__dirname, 'fixtures', 'resolves-assets-in-styles-duplicates'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    const fonts = output.filter(o => o.name?.endsWith('font-normal.woff2'));
    expect(fonts.length).to.equal(1);
  });

  it('handles images referenced from css', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          bundleAssetsFromCss: true,
          input: {
            html: `
              <html>
                <head>
                  <link rel="stylesheet" href="./styles.css" />
                </head>
                <body>
                </body>
              </html>
            `,
          },
          rootDir: path.join(__dirname, 'fixtures', 'resolves-assets-in-styles-images'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.find(o => o.name?.endsWith('star.avif'))).to.exist;
    expect(output.find(o => o.name?.endsWith('star.gif'))).to.exist;
    expect(output.find(o => o.name?.endsWith('star.jpeg'))).to.exist;
    expect(output.find(o => o.name?.endsWith('star.jpg'))).to.exist;
    expect(output.find(o => o.name?.endsWith('star.png'))).to.exist;
    expect(output.find(o => o.name?.endsWith('star.svg'))).to.exist;
    expect(output.find(o => o.name?.endsWith('star.webp'))).to.exist;

    const rewrittenCss = (output.find(o => o.name === 'styles.css') as OutputAsset).source
      .toString()
      .trim();
    expect(rewrittenCss).to.equal(
      `#a {
  background-image: url("assets/star-mrrzn5BV.svg");
}

#b {
  background-image: url("assets/star-mrrzn5BV.svg#foo");
}

#c {
  background-image: url("assets/star-eErsO14u.png");
}

#d {
  background-image: url("assets/star-yqfHyXQC.jpg");
}

#e {
  background-image: url("assets/star-G_i5Rpoh.jpeg");
}

#f {
  background-image: url("assets/star-l7b58t3m.webp");
}

#g {
  background-image: url("assets/star-P4TYRBwL.gif");
}

#h {
  background-image: url("assets/star-H06WHrYy.avif");
}`.trim(),
    );
  });

  it('allows to exclude external assets usign a glob pattern', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: {
            html: `<html>
<head>
<link rel="apple-touch-icon" sizes="180x180" href="./image-a.png" />
<link rel="icon" type="image/png" sizes="32x32" href="image-d.png" />
<link rel="manifest" href="./webmanifest.json" />
<link rel="mask-icon" href="./image-a.svg" color="#3f93ce" />
<link rel="mask-icon" href="image-d.svg" color="#3f93ce" />
<link rel="stylesheet" href="./styles-with-referenced-assets.css" />
<link rel="stylesheet" href="./foo/x.css" />
<link rel="stylesheet" href="foo/bar/y.css" />
</head>
<body>
<img src="./image-d.png" />
<div>
<img src="./image-d.svg" />
</div>
</body>
</html>`,
          },
          bundleAssetsFromCss: true,
          externalAssets: ['**/foo/**/*', '*.svg'],
          rootDir: path.join(__dirname, 'fixtures', 'assets'),
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(8);

    const expectedAssets = [
      'image-a.png',
      'image-d.png',
      'styles-with-referenced-assets.css',
      'image-a.png',
      'image-d.png',
      'webmanifest.json',
    ];

    for (const name of expectedAssets) {
      const asset = getAsset(output, name);
      expect(asset).to.exist;
      expect(asset.source).to.exist;
    }

    const outputHtml = getAsset(output, 'index.html').source;
    expect(outputHtml).to.include(
      '<link rel="apple-touch-icon" sizes="180x180" href="assets/image-a.png">',
    );
    expect(outputHtml).to.include(
      '<link rel="icon" type="image/png" sizes="32x32" href="assets/image-d.png">',
    );
    expect(outputHtml).to.include('<link rel="manifest" href="assets/webmanifest.json">');
    expect(outputHtml).to.include('<link rel="mask-icon" href="./image-a.svg" color="#3f93ce">');
    expect(outputHtml).to.include('<link rel="mask-icon" href="image-d.svg" color="#3f93ce">');
    expect(outputHtml).to.include(
      '<link rel="stylesheet" href="assets/styles-with-referenced-assets-NuwIw8gN.css">',
    );
    expect(outputHtml).to.include('<link rel="stylesheet" href="./foo/x.css">');
    expect(outputHtml).to.include('<link rel="stylesheet" href="foo/bar/y.css">');
    expect(outputHtml).to.include('<img src="assets/assets/image-d-y8_AQMDl.png">');
    expect(outputHtml).to.include('<img src="./image-d.svg">');

    const rewrittenCss = getAsset(output, 'styles-with-referenced-assets.css')
      .source.toString()
      .trim();
    expect(rewrittenCss).to.equal(
      `#a1 {
  background-image: url("assets/image-a-Mr5Lb2jQ.png");
}

#a2 {
  background-image: url("image-a.svg");
}

#d1 {
  background-image: url("assets/image-d-y8_AQMDl.png");
}

#d2 {
  background-image: url("./image-d.svg");
}`.trim(),
    );
  });
});
