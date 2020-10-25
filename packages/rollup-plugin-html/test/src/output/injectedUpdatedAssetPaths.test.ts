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
    const assetPaths = new Map<string, string>();
    assetPaths.set(path.join(path.sep, 'root', 'styles.css'), 'dist/styles-xxx.css');
    assetPaths.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'dist/image-a-xxx.png');
    assetPaths.set(path.join(path.sep, 'root', 'image-b.png'), 'dist/image-b-xxx.png');

    injectedUpdatedAssetPaths(document, input, '/root/', assetPaths);

    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="dist/styles-xxx.css"></head>',
      '<body>',
      '<img src="dist/image-a-xxx.png">',
      '<img src="dist/image-b-xxx.png">',
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
    const assetPaths = new Map<string, string>();
    assetPaths.set(path.join(path.sep, 'root', 'styles.css'), 'dist/styles-xxx.css');
    assetPaths.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'dist/image-a-xxx.png');
    assetPaths.set(path.join(path.sep, 'root', 'image-b.png'), 'dist/image-b-xxx.png');

    injectedUpdatedAssetPaths(document, input, '/root/', assetPaths);
    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="dist/styles-xxx.css"></head>',
      '<body>',
      '<img src="dist/image-a-xxx.png">',
      '<img src="dist/image-b-xxx.png">',
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
      name: 'index.html',
      moduleImports: [],
      inlineModules: new Map(),
      assets: [],
      filePath: '/root/foo/index.html',
    };
    const assetPaths = new Map<string, string>();
    assetPaths.set(path.join(path.sep, 'root', 'styles.css'), 'dist/styles-xxx.css');
    assetPaths.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'dist/image-a-xxx.png');
    assetPaths.set(path.join(path.sep, 'root', 'image-b.png'), 'dist/image-b-xxx.png');

    injectedUpdatedAssetPaths(document, input, '/root/', assetPaths);

    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="dist/styles-xxx.css"></head>',
      '<body>',
      '<img src="dist/image-a-xxx.png">',
      '<img src="dist/image-b-xxx.png">',
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
    const assetPaths = new Map<string, string>();
    assetPaths.set(path.join(path.sep, 'root', 'styles.css'), 'dist/styles-xxx.css');
    assetPaths.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'dist/image-a-xxx.png');
    assetPaths.set(path.join(path.sep, 'root', 'image-b.png'), 'dist/image-b-xxx.png');

    injectedUpdatedAssetPaths(document, input, '/root/', assetPaths);

    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="dist/styles-xxx.css"></head>',
      '<body>',
      '<img src="dist/image-a-xxx.png">',
      '<img src="dist/image-b-xxx.png">',
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
    const assetPaths = new Map<string, string>();
    assetPaths.set(path.join(path.sep, 'root', 'styles.css'), 'dist/styles-xxx.css');
    assetPaths.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'dist/image-a-xxx.png');
    assetPaths.set(path.join(path.sep, 'root', 'image-b.png'), 'dist/image-b-xxx.png');

    injectedUpdatedAssetPaths(document, input, '/root/', assetPaths, './public/');

    const expected = [
      '<html>',
      '<head><link rel="stylesheet" href="public/dist/styles-xxx.css"></head>',
      '<body>',
      '<img src="public/dist/image-a-xxx.png">',
      '<img src="public/dist/image-b-xxx.png">',
      '</body>',
      '</html>',
    ].join('');

    expect(serialize(document)).to.eql(expected);
  });
});
