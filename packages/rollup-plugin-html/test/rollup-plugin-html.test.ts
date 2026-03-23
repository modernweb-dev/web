import {
  rollup,
  type Plugin,
  type OutputChunk,
  type OutputAsset,
  type OutputOptions,
} from 'rollup';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';
import { rollupPluginHTML } from '../dist/index.js';

const __dirname = import.meta.dirname;

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
          input: path.resolve(__dirname, './fixtures/rollup-plugin-html/index.html'),
          rootDir,
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(output.length, 4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    assert.ok(entryA.includes("console.log('entrypoint-a.js');"));
    assert.ok(entryB.includes("console.log('entrypoint-b.js');"));
    assert.strictEqual(
      stripNewlines(getAsset(output, 'index.html').source),
      '<html><head></head><body><h1>hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '</body></html>',
    );
  });

  it('can build with html file as rollup input', async () => {
    const config = {
      input: path.resolve(__dirname, './fixtures/rollup-plugin-html/index.html'),
      plugins: [rollupPluginHTML({ rootDir })],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(output.length, 4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    assert.ok(entryA.includes("console.log('entrypoint-a.js');"));
    assert.ok(entryB.includes("console.log('entrypoint-b.js');"));
    assert.strictEqual(
      stripNewlines(getAsset(output, 'index.html').source),
      '<html><head></head><body><h1>hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '</body></html>',
    );
  });

  it('will retain attributes on script tags', async () => {
    const config = {
      input: path.resolve(__dirname, './fixtures/rollup-plugin-html/retain-attributes.html'),
      plugins: [rollupPluginHTML({ rootDir })],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(output.length, 4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    assert.ok(entryA.includes("console.log('entrypoint-a.js');"));
    assert.ok(entryB.includes("console.log('entrypoint-b.js');"));
    assert.strictEqual(
      stripNewlines(getAsset(output, 'retain-attributes.html').source),
      '<html><head></head><body><h1>hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js" keep-this-attribute=""></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '</body></html>',
    );
  });

  it('can build with pure html file as rollup input', async () => {
    const config = {
      input: path.resolve(__dirname, './fixtures/rollup-plugin-html/pure-index.html'),
      plugins: [rollupPluginHTML({ rootDir })],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(
      stripNewlines(getAsset(output, 'pure-index.html').source),
      '<html><head></head><body><h1>hello world</h1></body></html>',
    );
  });

  it('can build with multiple pure html inputs', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: [
            path.resolve(__dirname, './fixtures/rollup-plugin-html/pure-index.html'),
            path.resolve(__dirname, './fixtures/rollup-plugin-html/pure-index2.html'),
          ],
          rootDir,
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(
      stripNewlines(getAsset(output, 'pure-index.html').source),
      '<html><head></head><body><h1>hello world</h1></body></html>',
    );
    assert.strictEqual(
      stripNewlines(getAsset(output, 'pure-index2.html').source),
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
    assert.strictEqual(output.length, 2);
    assert.strictEqual(
      stripNewlines(getAsset(output, 'index.html').source),
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
    assert.strictEqual(output.length, 2);
    assert.strictEqual(
      stripNewlines(getAsset(output, 'pages/index.html').source),
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
    assert.strictEqual(output.length, 2);
    const hash = '5ec680a4efbb48ae254268ab1defe610';
    const { code: appCode } = getChunk(output, `inline-module-${hash}.js`);
    assert.ok(appCode.includes("console.log('entrypoint-a.js');"));
    assert.strictEqual(
      stripNewlines(getAsset(output, 'index.html').source),
      '<html><head></head><body><h1>Hello world</h1>' +
        `<script type="module" src="./inline-module-${hash}.js"></script>` +
        '</body></html>',
    );
  });

  it('resolves inline module imports relative to the HTML file', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: path.resolve(__dirname, './fixtures/rollup-plugin-html/foo/foo.html'),
          rootDir,
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(output.length, 2);
    const { code: appCode } = getChunk(output, 'inline-module-1b13383486c70d87f4e2585ff87b147c.js');
    assert.ok(appCode.includes("console.log('foo');"));
  });

  it('can build transforming final output', async () => {
    const config = {
      input: path.resolve(__dirname, './fixtures/rollup-plugin-html/entrypoint-a.js'),
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
    assert.strictEqual(output.length, 2);
    assert.strictEqual(
      getAsset(output, 'index.html').source,
      '<html><head></head><body><h1>Goodbye world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script></body></html>',
    );
  });

  it('can build with a public path', async () => {
    const config = {
      input: path.resolve(__dirname, './fixtures/rollup-plugin-html/entrypoint-a.js'),
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
    assert.strictEqual(output.length, 2);
    assert.strictEqual(
      getAsset(output, 'index.html').source,
      '<html><head></head><body><h1>Hello world</h1>' +
        '<script type="module" src="/static/entrypoint-a.js"></script></body></html>',
    );
  });

  it('can build with a public path with a file in a directory', async () => {
    const config = {
      input: path.resolve(__dirname, './fixtures/rollup-plugin-html/entrypoint-a.js'),
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
    assert.strictEqual(output.length, 2);
    assert.strictEqual(
      getAsset(output, 'pages/index.html').source,
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
      input: path.resolve(__dirname, './fixtures/rollup-plugin-html/entrypoint-a.js'),
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
    assert.strictEqual(outputA.length, 1);
    assert.strictEqual(outputB.length, 2);
    const { code: entrypointA1 } = getChunk(outputA, 'entrypoint-a.js');
    const { code: entrypointA2 } = getChunk(outputB, 'entrypoint-a.js');
    assert.ok(entrypointA1.includes("console.log('entrypoint-a.js');"));
    assert.ok(entrypointA1.includes("console.log('module-a.js');"));
    assert.ok(entrypointA2.includes("console.log('entrypoint-a.js');"));
    assert.ok(entrypointA2.includes("console.log('module-a.js');"));
    assert.strictEqual(getAsset(outputA, 'index.html'), undefined);
    assert.strictEqual(
      getAsset(outputB, 'index.html').source,
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
    assert.strictEqual(output.length, 4);
    assert.ok(getChunk(output, 'entrypoint-a.js'));
    assert.strictEqual(
      getAsset(output, 'index.html').source,
      '<html><head></head><body><h1>Hello world</h1>' +
        '<script type="module" src="./entrypoint-a.js"></script></body></html>',
    );
    assert.strictEqual(
      getAsset(output, 'foo.html').source,
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
    assert.strictEqual(output.length, 7);
    assert.ok(getChunk(output, 'entrypoint-a.js'));
    assert.ok(getChunk(output, 'entrypoint-b.js'));
    assert.ok(getChunk(output, 'entrypoint-c.js'));
    assert.strictEqual(
      getAsset(output, 'page-a.html').source,
      '<html><head></head><body><h1>Page A</h1><script type="module" src="./entrypoint-a.js"></script></body></html>',
    );
    assert.strictEqual(
      getAsset(output, 'page-b.html').source,
      '<html><head></head><body><h1>Page B</h1><script type="module" src="./entrypoint-b.js"></script></body></html>',
    );
    assert.strictEqual(
      getAsset(output, 'page-c.html').source,
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
    assert.strictEqual(output.length, 7);
    assert.ok(getChunk(output, 'page-a.js'));
    assert.ok(getChunk(output, 'page-b.js'));
    assert.ok(getChunk(output, 'page-c.js'));
    assert.ok(pageA.includes('<p>page-a.html</p>'));
    assert.ok(pageA.includes('<script type="module" src="./page-a.js"></script>'));
    assert.ok(pageA.includes('<script type="module" src="./shared.js"></script>'));
    assert.ok(pageB.includes('<p>page-b.html</p>'));
    assert.ok(pageB.includes('<script type="module" src="./page-b.js"></script>'));
    assert.ok(pageB.includes('<script type="module" src="./shared.js"></script>'));
    assert.ok(pageC.includes('<p>page-c.html</p>'));
    assert.ok(pageC.includes('<script type="module" src="./page-c.js"></script>'));
    assert.ok(pageC.includes('<script type="module" src="./shared.js"></script>'));
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
    assert.strictEqual(output.length, 2);
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
    assert.strictEqual(output.length, 6);
    assert.ok(getChunk(output, 'inline-module-b8667c926d8a16ee8b4499492c1726ed.js'));
    assert.ok(getChunk(output, 'inline-module-c91911481b66e7483731d4de5df616a6.js'));
    assert.ok(getChunk(output, 'inline-module-fbf0242ebea027b7392472c19328791d.js'));
    assert.strictEqual(
      getAsset(output, 'foo/index.html').source,
      '<html><head></head><body><h1>Page A</h1><script type="module" src="../inline-module-b8667c926d8a16ee8b4499492c1726ed.js"></script></body></html>',
    );
    assert.strictEqual(
      getAsset(output, 'bar/index.html').source,
      '<html><head></head><body><h1>Page B</h1><script type="module" src="../inline-module-c91911481b66e7483731d4de5df616a6.js"></script></body></html>',
    );
    assert.strictEqual(
      getAsset(output, 'x.html').source,
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
    assert.strictEqual(output.length, 4);
    assert.ok(getChunk(output, 'inline-module-b8667c926d8a16ee8b4499492c1726ed.js'));
    assert.strictEqual(
      getAsset(output, 'a.html').source,
      '<html><head></head><body><h1>Page A</h1><script type="module" src="./inline-module-b8667c926d8a16ee8b4499492c1726ed.js"></script></body></html>',
    );
    assert.strictEqual(
      getAsset(output, 'b.html').source,
      '<html><head></head><body><h1>Page B</h1><script type="module" src="./inline-module-b8667c926d8a16ee8b4499492c1726ed.js"></script></body></html>',
    );
    assert.strictEqual(
      getAsset(output, 'c.html').source,
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
    assert.strictEqual(output.length, 2);
    const entrypoint = output.find(f =>
      // @ts-ignore
      f.facadeModuleId.endsWith('entrypoint-a.js'),
    ) as OutputChunk;
    // ensure it's actually hashed
    assert.notStrictEqual(entrypoint.fileName, 'entrypoint-a.js');
    // get hashed name dynamically
    assert.strictEqual(
      getAsset(output, 'index.html').source,
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
    assert.strictEqual(output.length, 2);
    assert.strictEqual(
      getAsset(output, 'pages/index.html').source,
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
    assert.strictEqual(output.length, 2);
    assert.strictEqual(
      getAsset(output, 'rollup-plugin-html/pages/index.html').source,
      '<html><head></head><body><h1>Hello world</h1><script type="module" src="../../entrypoint-a.js"></script></body></html>',
    );
  });

  it('can get the input with getInputs()', async () => {
    // default filename
    const pluginA = rollupPluginHTML({ input: { html: 'Hello world' } });
    // filename inferred from input filename
    const pluginB = rollupPluginHTML({
      input: path.resolve(__dirname, './fixtures/rollup-plugin-html/my-page.html'),
    });
    // filename explicitly set
    const pluginC = rollupPluginHTML({
      input: {
        name: 'pages/my-other-page.html',
        path: path.resolve(__dirname, './fixtures/rollup-plugin-html/index.html'),
      },
    });
    await rollup({
      input: path.resolve(__dirname, './fixtures/rollup-plugin-html/entrypoint-a.js'),
      plugins: [pluginA],
    });
    await rollup({ plugins: [pluginB] });
    await rollup({ plugins: [pluginC] });
    assert.strictEqual(pluginA.api.getInputs()[0].name, 'index.html');
    assert.strictEqual(pluginB.api.getInputs()[0].name, 'my-page.html');
    assert.strictEqual(pluginC.api.getInputs()[0].name, 'pages/my-other-page.html');
  });

  it('supports other plugins injecting a transform function', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: path.resolve(__dirname, './fixtures/rollup-plugin-html/index.html'),
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
              html.replace('</body>', '<!-- injected to output --></body>'),
            );
            plugin!.api.addHtmlTransformer(
              (html: string) =>
                html.replace('<!-- injected to output -->', '<!-- injected to output 2 -->'),
              'output',
            );
            plugin!.api.addHtmlTransformer(
              (html: string) => html.replace('</body>', '<!-- injected to input --></body>'),
              'input',
            );
          },
        } as Plugin,
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(output.length, 4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    assert.ok(entryA.includes("console.log('entrypoint-a.js');"));
    assert.ok(entryB.includes("console.log('entrypoint-b.js');"));
    assert.strictEqual(
      stripNewlines(getAsset(output, 'index.html').source),
      '<html><head></head><body><h1>hello world</h1>' +
        '<!-- injected to input -->' +
        '<script type="module" src="./entrypoint-a.js"></script>' +
        '<script type="module" src="./entrypoint-b.js"></script>' +
        '<!-- injected to output 2 --></body></html>',
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
    assert.strictEqual(output.length, 11);
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
      assert.ok(asset);
      assert.ok(asset.source);
    }

    const outputHtml = getAsset(output, 'index.html').source;
    assert.ok(
      outputHtml.includes(
        '<link rel="apple-touch-icon" sizes="180x180" href="assets/image-a.png">',
      ),
    );
    assert.ok(
      outputHtml.includes(
        '<link rel="icon" type="image/png" sizes="32x32" href="assets/image-b.png">',
      ),
    );
    assert.ok(outputHtml.includes('<link rel="manifest" href="assets/webmanifest.json">'));
    assert.ok(
      outputHtml.includes('<link rel="mask-icon" href="assets/image-a.svg" color="#3f93ce">'),
    );
    assert.ok(outputHtml.includes('<link rel="stylesheet" href="assets/styles-CF2Iy5n1.css">'));
    assert.ok(outputHtml.includes('<link rel="stylesheet" href="assets/x-DDGg8O6h.css">'));
    assert.ok(outputHtml.includes('<link rel="stylesheet" href="assets/y-DJTrnPH3.css">'));
    assert.ok(outputHtml.includes('<img src="assets/image-c-yvktvaNB.png">'));
    assert.ok(outputHtml.includes('<img src="assets/image-b-DKsNZzOf.svg">'));
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

    assert.strictEqual(
      stripNewlines(getAsset(output, 'index.html').source),
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

    assert.strictEqual(
      stripNewlines(getAsset(output, 'index.html').source),
      '<html><head><link rel="icon" type="image/png" sizes="32x32" href="assets/foo.svg"></head>' +
        '<body><img src="assets/foo-BaOCt8wZ.svg"></body></html>',
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

    assert.strictEqual(
      stripNewlines(getAsset(output, 'index.html').source),
      '<html><head></head><body>' +
        '<link rel="stylesheet" href="assets/image-a-yvktvaNB.png">' +
        '<img src="assets/image-a-yvktvaNB.png">' +
        '<img src="assets/image-a-yvktvaNB.png">' +
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

    assert.strictEqual(
      stripNewlines(getAsset(output, 'page-a.html').source),
      '<html><head></head><body>' +
        '  <img src="assets/image-a-yvktvaNB.png">' +
        '    </body></html>',
    );

    assert.strictEqual(
      stripNewlines(getAsset(output, 'page-b.html').source),
      '<html><head></head><body>' +
        '  <link rel="stylesheet" href="assets/image-a-yvktvaNB.png">' +
        '    </body></html>',
    );

    assert.strictEqual(
      stripNewlines(getAsset(output, 'page-c.html').source),
      '<html><head></head><body>' +
        '  <link rel="stylesheet" href="assets/image-a-yvktvaNB.png">' +
        '  <img src="assets/image-a-yvktvaNB.png">' +
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

    assert.strictEqual(output.length, 2);
    assert.strictEqual(
      stripNewlines(getAsset(output, 'index.html').source),
      '<html><head></head><body><img src="./image-c.png"><link rel="stylesheet" href="./styles.css"><img src="./image-b.svg"></body></html>',
    );
  });

  it('can inject a CSP meta tag for inline scripts', async () => {
    const config = {
      plugins: [
        rollupPluginHTML({
          input: path.resolve(__dirname, './fixtures/rollup-plugin-html/csp-page-a.html'),
          rootDir,
          strictCSPInlineScripts: true,
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(output.length, 4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    assert.ok(entryA.includes("console.log('entrypoint-a.js');"));
    assert.ok(entryB.includes("console.log('entrypoint-b.js');"));
    assert.strictEqual(
      stripNewlines(getAsset(output, 'csp-page-a.html').source),
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
          input: path.resolve(__dirname, './fixtures/rollup-plugin-html/csp-page-b.html'),
          rootDir,
          strictCSPInlineScripts: true,
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(output.length, 4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    assert.ok(entryA.includes("console.log('entrypoint-a.js');"));
    assert.ok(entryB.includes("console.log('entrypoint-b.js');"));
    assert.strictEqual(
      stripNewlines(getAsset(output, 'csp-page-b.html').source),
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
          input: path.resolve(__dirname, './fixtures/rollup-plugin-html/csp-page-c.html'),
          rootDir,
          strictCSPInlineScripts: true,
        }),
      ],
    };
    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);
    assert.strictEqual(output.length, 4);
    const { code: entryA } = getChunk(output, 'entrypoint-a.js');
    const { code: entryB } = getChunk(output, 'entrypoint-b.js');
    assert.ok(entryA.includes("console.log('entrypoint-a.js');"));
    assert.ok(entryB.includes("console.log('entrypoint-b.js');"));
    assert.strictEqual(
      stripNewlines(getAsset(output, 'csp-page-c.html').source),
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

    assert.strictEqual(
      extractServiceWorkerPath(getAsset(output, 'index.html').source),
      'service-worker.js',
    );
    assert.strictEqual(
      extractServiceWorkerPath(getAsset(output, path.join('sub-with-js', 'index.html')).source),
      `../service-worker.js`,
    );
    assert.strictEqual(
      extractServiceWorkerPath(getAsset(output, path.join('sub-pure-html', 'index.html')).source),
      `../service-worker.js`,
    );
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

    assert.strictEqual(
      stripNewlines(getAsset(output, 'x/index.html').source),
      [
        '<html><head></head><body>',
        '<img src="../assets/foo-AJnkzla8.svg">',
        '<link rel="stylesheet" href="../assets/styles-CF2Iy5n1.css">',
        '<img src="../assets/image-b-DKsNZzOf.svg">',
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
    assert.ok(fontBold);
    assert.ok(fontNormal);
    // e.g. "font-normal-f0mNRiTD.woff2"
    // eslint-disable-next-line no-useless-escape
    const regex = /assets[\/\\]font-normal-\w+\.woff2/;
    // It outputs the font to the assets folder
    assert.strictEqual(regex.test(fontNormal!.fileName), true);

    // The source of the style includes the font
    const source = (style as OutputAsset)?.source.toString();
    assert.ok(source.includes(fontNormal!.fileName));
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
    assert.ok(font);
    // e.g. "font-normal-f0mNRiTD.woff2"
    // eslint-disable-next-line no-useless-escape
    const regex = /assets[\/\\]font-normal-\w+\.woff2/;
    // It outputs the font to the assets folder
    assert.strictEqual(regex.test(font!.fileName), true);

    // The source of the style includes the font
    const source = (style as OutputAsset)?.source.toString();
    assert.ok(source.includes(font!.fileName));
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
    assert.strictEqual(fonts.length, 1);
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

    assert.ok(output.find(o => o.name?.endsWith('star.avif')));
    assert.ok(output.find(o => o.name?.endsWith('star.gif')));
    assert.ok(output.find(o => o.name?.endsWith('star.jpeg')));
    assert.ok(output.find(o => o.name?.endsWith('star.jpg')));
    assert.ok(output.find(o => o.name?.endsWith('star.png')));
    assert.ok(output.find(o => o.name?.endsWith('star.svg')));
    assert.ok(output.find(o => o.name?.endsWith('star.webp')));

    const rewrittenCss = (output.find(o => o.name === 'styles.css') as OutputAsset).source
      .toString()
      .trim();
    assert.strictEqual(
      rewrittenCss,
      `#a {
  background-image: url("assets/star-CauvOfkF.svg");
}

#b {
  background-image: url("assets/star-CauvOfkF.svg#foo");
}

#c {
  background-image: url("assets/star-B4Suw7Xi.png");
}

#d {
  background-image: url("assets/star-DKp8fJdA.jpg");
}

#e {
  background-image: url("assets/star-b-LlGmiF.jpeg");
}

#f {
  background-image: url("assets/star-CXtvny3e.webp");
}

#g {
  background-image: url("assets/star-_hNhEHAt.gif");
}

#h {
  background-image: url("assets/star-fTpYetjL.avif");
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

    assert.strictEqual(output.length, 8);

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
      assert.ok(asset);
      assert.ok(asset.source);
    }

    const outputHtml = getAsset(output, 'index.html').source;
    assert.ok(
      outputHtml.includes(
        '<link rel="apple-touch-icon" sizes="180x180" href="assets/image-a.png">',
      ),
    );
    assert.ok(
      outputHtml.includes(
        '<link rel="icon" type="image/png" sizes="32x32" href="assets/image-d.png">',
      ),
    );
    assert.ok(outputHtml.includes('<link rel="manifest" href="assets/webmanifest.json">'));
    assert.ok(outputHtml.includes('<link rel="mask-icon" href="./image-a.svg" color="#3f93ce">'));
    assert.ok(outputHtml.includes('<link rel="mask-icon" href="image-d.svg" color="#3f93ce">'));
    assert.ok(
      outputHtml.includes(
        '<link rel="stylesheet" href="assets/styles-with-referenced-assets-C5klO55x.css">',
      ),
    );
    assert.ok(outputHtml.includes('<link rel="stylesheet" href="./foo/x.css">'));
    assert.ok(outputHtml.includes('<link rel="stylesheet" href="foo/bar/y.css">'));
    assert.ok(outputHtml.includes('<img src="assets/image-d-DLz8BAwO.png">'));
    assert.ok(outputHtml.includes('<img src="./image-d.svg">'));

    const rewrittenCss = getAsset(output, 'styles-with-referenced-assets.css')
      .source.toString()
      .trim();
    assert.strictEqual(
      rewrittenCss,
      `#a1 {
  background-image: url("assets/image-a-yvktvaNB.png");
}

#a2 {
  background-image: url("image-a.svg");
}

#d1 {
  background-image: url("assets/image-d-DLz8BAwO.png");
}

#d2 {
  background-image: url("./image-d.svg");
}`.trim(),
    );
  });
});
