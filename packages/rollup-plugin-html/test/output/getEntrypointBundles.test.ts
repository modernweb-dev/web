import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getEntrypointBundles, createImportPath } from '../../src/output/getEntrypointBundles.ts';
import type { GeneratedBundle, ScriptModuleTag } from '../../src/RollupPluginHTMLOptions.ts';

describe('createImportPath()', () => {
  it('creates a relative import path', () => {
    assert.strictEqual(
      createImportPath({
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
      './foo.js',
    );
  });

  it('handles files output in a different directory', () => {
    assert.strictEqual(
      createImportPath({
        outputDir: 'dist',
        fileOutputDir: 'dist/legacy',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
      './legacy/foo.js',
    );
  });

  it('handles directory in filename', () => {
    assert.strictEqual(
      createImportPath({
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'legacy/foo.js',
      }),
      './legacy/foo.js',
    );
  });

  it('allows configuring a public path', () => {
    assert.strictEqual(
      createImportPath({
        publicPath: 'static',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
      './static/foo.js',
    );
  });

  it('allows configuring an absolute public path', () => {
    assert.strictEqual(
      createImportPath({
        publicPath: '/static',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
      '/static/foo.js',
    );
  });

  it('allows configuring an absolute public path with just a /', () => {
    assert.strictEqual(
      createImportPath({
        publicPath: '/',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
      '/foo.js',
    );
  });

  it('allows configuring an absolute public path with a trailing /', () => {
    assert.strictEqual(
      createImportPath({
        publicPath: '/static/public/',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
      '/static/public/foo.js',
    );
  });

  it('respects a different output dir when configuring a public path', () => {
    assert.strictEqual(
      createImportPath({
        publicPath: '/static',
        outputDir: 'dist',
        fileOutputDir: 'dist/legacy',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
      '/static/legacy/foo.js',
    );
  });

  it('when html is output in a directory, creates a relative path from the html file to the js file', () => {
    assert.strictEqual(
      createImportPath({
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'pages/index.html',
        fileName: 'foo.js',
      }),
      '../foo.js',
    );
  });

  it('when html is output in a directory and absolute path is set, creates a direct path from the root to the js file', () => {
    assert.strictEqual(
      createImportPath({
        publicPath: '/static/',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'pages/index.html',
        fileName: 'foo.js',
      }),
      '/static/foo.js',
    );
  });
});

describe('getEntrypointBundles()', () => {
  const defaultBundles: GeneratedBundle[] = [
    {
      name: 'default',
      options: { format: 'es', dir: 'dist' },
      bundle: {
        // @ts-ignore
        'app.js': {
          isEntry: true,
          fileName: 'app.js',
          facadeModuleId: '/root/app.js',
          type: 'chunk',
        },
      },
    },
  ];

  const inputModuleIds: ScriptModuleTag[] = [
    { importPath: '/root/app.js' },
    { importPath: '/root/foo.js' },
  ];

  const defaultOptions = {
    pluginOptions: {},
    inputModuleIds,
    outputDir: 'dist',
    htmlFileName: 'index.html',
    generatedBundles: defaultBundles,
  };

  it('generates entrypoints for a simple project', async () => {
    const output = await getEntrypointBundles(defaultOptions);
    assert.strictEqual(Object.keys(output).length, 1);
    assert.strictEqual(output.default.options, defaultBundles[0].options);
    assert.strictEqual(output.default.bundle, defaultBundles[0].bundle);
    assert.strictEqual(output.default.entrypoints.length, 1);
    assert.strictEqual(output.default.entrypoints[0].chunk, defaultBundles[0].bundle['app.js']);
    assert.deepStrictEqual(
      output.default.entrypoints.map(e => e.importPath),
      ['./app.js'],
    );
  });

  it('does not output non-entrypoints', async () => {
    const generatedBundles: GeneratedBundle[] = [
      {
        name: 'default',
        options: { format: 'es', dir: 'dist' },
        bundle: {
          // @ts-ignore
          'app.js': {
            isEntry: true,
            fileName: 'app.js',
            facadeModuleId: '/root/app.js',
            type: 'chunk',
          },
          // @ts-ignore
          'not-app.js': {
            isEntry: false,
            fileName: 'not-app.js',
            facadeModuleId: '/root/app.js',
            type: 'chunk',
          },
        },
      },
    ];
    const output = await getEntrypointBundles({
      ...defaultOptions,
      generatedBundles,
    });
    assert.strictEqual(Object.keys(output).length, 1);
    assert.strictEqual(output.default.entrypoints.length, 1);
    assert.deepStrictEqual(
      output.default.entrypoints.map(e => e.importPath),
      ['./app.js'],
    );
  });

  it('does not output non-chunks', async () => {
    const generatedBundles: GeneratedBundle[] = [
      {
        name: 'default',
        options: { format: 'es', dir: 'dist' },
        bundle: {
          // @ts-ignore
          'app.js': {
            isEntry: true,
            fileName: 'app.js',
            facadeModuleId: '/root/app.js',
            type: 'chunk',
          },
          // @ts-ignore
          'not-app.js': {
            // @ts-ignore
            isEntry: true,
            fileName: 'not-app.js',
            facadeModuleId: '/root/app.js',
            type: 'asset',
          },
        },
      },
    ];
    const output = await getEntrypointBundles({
      ...defaultOptions,
      generatedBundles,
    });
    assert.strictEqual(Object.keys(output).length, 1);
    assert.strictEqual(output.default.entrypoints.length, 1);
    assert.deepStrictEqual(
      output.default.entrypoints.map(e => e.importPath),
      ['./app.js'],
    );
  });

  it('matches on facadeModuleId', async () => {
    const generatedBundles: GeneratedBundle[] = [
      {
        name: 'default',
        options: { format: 'es', dir: 'dist' },
        bundle: {
          // @ts-ignore
          'app.js': {
            isEntry: true,
            fileName: 'app.js',
            facadeModuleId: '/root/app.js',
            type: 'chunk',
          },
          // @ts-ignore
          'not-app.js': {
            isEntry: true,
            fileName: 'not-app.js',
            facadeModuleId: '/root/not-app.js',
            type: 'chunk',
          },
        },
      },
    ];
    const output = await getEntrypointBundles({
      ...defaultOptions,
      generatedBundles,
    });
    assert.strictEqual(Object.keys(output).length, 1);
    assert.strictEqual(output.default.entrypoints.length, 1);
    assert.deepStrictEqual(
      output.default.entrypoints.map(e => e.importPath),
      ['./app.js'],
    );
  });

  it('returns all entrypoints when no input module ids are given', async () => {
    const generatedBundles: GeneratedBundle[] = [
      {
        name: 'default',
        options: { format: 'es', dir: 'dist' },
        bundle: {
          // @ts-ignore
          'app.js': {
            isEntry: true,
            fileName: 'app.js',
            facadeModuleId: '/root/app.js',
            type: 'chunk',
          },
          // @ts-ignore
          'not-app.js': {
            isEntry: true,
            fileName: 'not-app.js',
            facadeModuleId: '/root/not-app.js',
            type: 'chunk',
          },
        },
      },
    ];

    const inputModuleIds: ScriptModuleTag[] = [
      { importPath: '/root/app.js' },
      { importPath: '/root/not-app.js' },
    ];

    const output = await getEntrypointBundles({
      ...defaultOptions,
      inputModuleIds,
      generatedBundles,
    });
    assert.strictEqual(Object.keys(output).length, 1);
    assert.strictEqual(output.default.entrypoints.length, 2);
    assert.deepStrictEqual(
      output.default.entrypoints.map(e => e.importPath),
      ['./app.js', './not-app.js'],
    );
  });

  it('generates entrypoint for multiple bundles', async () => {
    const generatedBundles: GeneratedBundle[] = [
      {
        name: 'modern',
        options: { format: 'es', dir: 'dist' },
        bundle: {
          // @ts-ignore
          'app.js': {
            isEntry: true,
            fileName: 'app.js',
            facadeModuleId: '/root/app.js',
            type: 'chunk',
          },
        },
      },
      {
        name: 'legacy',
        options: { format: 'es', dir: 'dist/legacy' },
        bundle: {
          // @ts-ignore
          'app.js': {
            isEntry: true,
            fileName: 'app.js',
            facadeModuleId: '/root/app.js',
            type: 'chunk',
          },
        },
      },
    ];

    const output = await getEntrypointBundles({
      ...defaultOptions,
      generatedBundles,
    });

    assert.strictEqual(Object.keys(output).length, 2);
    assert.strictEqual(output.modern.options, generatedBundles[0].options);
    assert.strictEqual(output.legacy.options, generatedBundles[1].options);
    assert.strictEqual(output.modern.bundle, generatedBundles[0].bundle);
    assert.strictEqual(output.legacy.bundle, generatedBundles[1].bundle);
    assert.strictEqual(output.modern.entrypoints.length, 1);
    assert.strictEqual(output.modern.entrypoints[0].chunk, generatedBundles[0].bundle['app.js']);
    assert.deepStrictEqual(
      output.modern.entrypoints.map(e => e.importPath),
      ['./app.js'],
    );
    assert.strictEqual(output.legacy.entrypoints.length, 1);
    assert.strictEqual(output.legacy.entrypoints[0].chunk, generatedBundles[1].bundle['app.js']);
    assert.deepStrictEqual(
      output.legacy.entrypoints.map(e => e.importPath),
      ['./legacy/app.js'],
    );
  });

  it('allows configuring a public path', async () => {
    const output = await getEntrypointBundles({
      ...defaultOptions,
      pluginOptions: { publicPath: '/static' },
    });

    assert.strictEqual(Object.keys(output).length, 1);
    assert.strictEqual(output.default.entrypoints.length, 1);
    assert.deepStrictEqual(
      output.default.entrypoints.map(e => e.importPath),
      ['/static/app.js'],
    );
  });
});
