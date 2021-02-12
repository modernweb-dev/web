import { expect } from 'chai';
import path from 'path';
import { parse, serialize } from 'parse5';
import { InputData } from '../../../src/input/InputData';

import { injectedUpdatedAssetPaths } from '../../../src/output/injectedUpdatedAssetPaths';

describe('injectedUpdatedAssetPaths()', () => {
  it('injects updated asset paths', () => {
    const document = parse(
      [
        '<html>',
        '<head><link rel="stylesheet" href="./styles.css"></head>',
        '<body>',
        '<img src="./foo/image-a.png">',
        '<img src="/image-b.png">',
        '<script src="/no-module.js"></script>',
        '</body>',
        '</html>',
      ].join(''),
    );

    const input: InputData = {
      html: '',
      name: 'index.html',
      moduleImports: [],
      inlineModules: new Map(),
      assets: [],
      filePath: '/root/index.html',
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'no-module.js'), 'no-module-xxx.js');

    injectedUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });

    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="styles-xxx.css"></head>',
      '<body>',
      '<img src="image-a-xxx.png">',
      '<img src="image-b-xxx.png">',
      '<script src="no-module-xxx.js"></script>',
      '</body>',
      '</html>',
    ].join('');

    expect(serialize(document)).to.eql(expected);
  });

  it('handles virtual files', () => {
    const document = parse(
      [
        '<html>',
        '<head><link rel="stylesheet" href="./styles.css"></head>',
        '<body>',
        '<img src="./foo/image-a.png">',
        '<img src="/image-b.png">',
        '</body>',
        '</html>',
      ].join(''),
    );

    const input: InputData = {
      html: '',
      name: 'index.html',
      moduleImports: [],
      inlineModules: new Map(),
      assets: [],
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');

    injectedUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });
    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="styles-xxx.css"></head>',
      '<body>',
      '<img src="image-a-xxx.png">',
      '<img src="image-b-xxx.png">',
      '</body>',
      '</html>',
    ].join('');

    expect(serialize(document)).to.eql(expected);
  });

  it('handles HTML files in a sub directory', () => {
    const document = parse(
      [
        '<html>',
        '<head><link rel="stylesheet" href="../styles.css"></head>',
        '<body>',
        '<img src="./image-a.png">',
        '<img src="/image-b.png">',
        '</body>',
        '</html>',
      ].join(''),
    );

    const input: InputData = {
      html: '',
      name: 'foo/index.html',
      moduleImports: [],
      inlineModules: new Map(),
      assets: [],
      filePath: '/root/foo/index.html',
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');

    injectedUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });

    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="../styles-xxx.css"></head>',
      '<body>',
      '<img src="../image-a-xxx.png">',
      '<img src="../image-b-xxx.png">',
      '</body>',
      '</html>',
    ].join('');

    expect(serialize(document)).to.eql(expected);
  });

  it('handles virtual HTML files in a sub directory', () => {
    const document = parse(
      [
        '<html>',
        '<head><link rel="stylesheet" href="../styles.css"></head>',
        '<body>',
        '<img src="./image-a.png">',
        '<img src="/image-b.png">',
        '</body>',
        '</html>',
      ].join(''),
    );

    const input: InputData = {
      html: '',
      name: 'foo/index.html',
      moduleImports: [],
      inlineModules: new Map(),
      assets: [],
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');

    injectedUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });

    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="../styles-xxx.css"></head>',
      '<body>',
      '<img src="../image-a-xxx.png">',
      '<img src="../image-b-xxx.png">',
      '</body>',
      '</html>',
    ].join('');

    expect(serialize(document)).to.eql(expected);
  });

  it('prefixes a publicpath', () => {
    const document = parse(
      [
        '<html>',
        '<head><link rel="stylesheet" href="./styles.css"></head>',
        '<body>',
        '<img src="./foo/image-a.png">',
        '<img src="/image-b.png">',
        '</body>',
        '</html>',
      ].join(''),
    );

    const input: InputData = {
      html: '',
      name: 'index.html',
      moduleImports: [],
      inlineModules: new Map(),
      assets: [],
      filePath: '/root/index.html',
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');

    injectedUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
      publicPath: './public/',
    });

    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="public/styles-xxx.css"></head>',
      '<body>',
      '<img src="public/image-a-xxx.png">',
      '<img src="public/image-b-xxx.png">',
      '</body>',
      '</html>',
    ].join('');

    expect(serialize(document)).to.eql(expected);
  });
});
