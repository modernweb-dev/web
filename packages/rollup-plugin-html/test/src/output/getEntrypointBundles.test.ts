import { expect } from 'chai';
import {
  getEntrypointBundles,
  createImportPath,
} from '../../../src/output/getEntrypointBundles.js';
import { GeneratedBundle, ScriptModuleTag } from '../../../src/RollupPluginHTMLOptions.js';

describe('createImportPath()', () => {
  it('creates a relative import path', () => {
    expect(
      createImportPath({
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
    ).to.equal('./foo.js');
  });

  it('handles files output in a different directory', () => {
    expect(
      createImportPath({
        outputDir: 'dist',
        fileOutputDir: 'dist/legacy',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
    ).to.equal('./legacy/foo.js');
  });

  it('handles directory in filename', () => {
    expect(
      createImportPath({
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'legacy/foo.js',
      }),
    ).to.equal('./legacy/foo.js');
  });

  it('allows configuring a public path', () => {
    expect(
      createImportPath({
        publicPath: 'static',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
    ).to.equal('./static/foo.js');
  });

  it('allows configuring an absolute public path', () => {
    expect(
      createImportPath({
        publicPath: '/static',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
    ).to.equal('/static/foo.js');
  });

  it('allows configuring an absolute public path with just a /', () => {
    expect(
      createImportPath({
        publicPath: '/',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
    ).to.equal('/foo.js');
  });

  it('allows configuring an absolute public path with a trailing /', () => {
    expect(
      createImportPath({
        publicPath: '/static/public/',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
    ).to.equal('/static/public/foo.js');
  });

  it('respects a different output dir when configuring a public path', () => {
    expect(
      createImportPath({
        publicPath: '/static',
        outputDir: 'dist',
        fileOutputDir: 'dist/legacy',
        htmlFileName: 'index.html',
        fileName: 'foo.js',
      }),
    ).to.equal('/static/legacy/foo.js');
  });

  it('when html is output in a directory, creates a relative path from the html file to the js file', () => {
    expect(
      createImportPath({
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'pages/index.html',
        fileName: 'foo.js',
      }),
    ).to.equal('../foo.js');
  });

  it('when html is output in a directory and absolute path is set, creates a direct path from the root to the js file', () => {
    expect(
      createImportPath({
        publicPath: '/static/',
        outputDir: 'dist',
        fileOutputDir: 'dist',
        htmlFileName: 'pages/index.html',
        fileName: 'foo.js',
      }),
    ).to.equal('/static/foo.js');
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
    expect(Object.keys(output).length).to.equal(1);
    expect(output.default.options).to.equal(defaultBundles[0].options);
    expect(output.default.bundle).to.equal(defaultBundles[0].bundle);
    expect(output.default.entrypoints.length).to.equal(1);
    expect(output.default.entrypoints[0].chunk).to.equal(defaultBundles[0].bundle['app.js']);
    expect(output.default.entrypoints.map(e => e.importPath)).to.eql(['./app.js']);
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
    expect(Object.keys(output).length).to.equal(1);
    expect(output.default.entrypoints.length).to.equal(1);
    expect(output.default.entrypoints.map(e => e.importPath)).to.eql(['./app.js']);
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
    expect(Object.keys(output).length).to.equal(1);
    expect(output.default.entrypoints.length).to.equal(1);
    expect(output.default.entrypoints.map(e => e.importPath)).to.eql(['./app.js']);
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
    expect(Object.keys(output).length).to.equal(1);
    expect(output.default.entrypoints.length).to.equal(1);
    expect(output.default.entrypoints.map(e => e.importPath)).to.eql(['./app.js']);
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
    expect(Object.keys(output).length).to.equal(1);
    expect(output.default.entrypoints.length).to.equal(2);
    expect(output.default.entrypoints.map(e => e.importPath)).to.eql(['./app.js', './not-app.js']);
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

    expect(Object.keys(output).length).to.equal(2);
    expect(output.modern.options).to.equal(generatedBundles[0].options);
    expect(output.legacy.options).to.equal(generatedBundles[1].options);
    expect(output.modern.bundle).to.equal(generatedBundles[0].bundle);
    expect(output.legacy.bundle).to.equal(generatedBundles[1].bundle);
    expect(output.modern.entrypoints.length).to.equal(1);
    expect(output.modern.entrypoints[0].chunk).to.equal(generatedBundles[0].bundle['app.js']);
    expect(output.modern.entrypoints.map(e => e.importPath)).to.eql(['./app.js']);
    expect(output.legacy.entrypoints.length).to.equal(1);
    expect(output.legacy.entrypoints[0].chunk).to.equal(generatedBundles[1].bundle['app.js']);
    expect(output.legacy.entrypoints.map(e => e.importPath)).to.eql(['./legacy/app.js']);
  });

  it('allows configuring a public path', async () => {
    const output = await getEntrypointBundles({
      ...defaultOptions,
      pluginOptions: { publicPath: '/static' },
    });

    expect(Object.keys(output).length).to.equal(1);
    expect(output.default.entrypoints.length).to.equal(1);
    expect(output.default.entrypoints.map(e => e.importPath)).to.eql(['/static/app.js']);
  });
});
