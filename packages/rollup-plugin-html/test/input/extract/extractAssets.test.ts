import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parse } from 'parse5';
import path from 'path';
import { extractAssets } from '../../../src/input/extract/extractAssets.ts';

const __dirname = import.meta.dirname;
const rootDir = path.resolve(__dirname, '..', '..', 'fixtures', 'assets');

describe('extractAssets', () => {
  it('extracts assets from a document', () => {
    const document = parse(`
      <html>
        <head>
          <link rel="apple-touch-icon" sizes="180x180" href="./image-a.png">
          <link rel="icon" type="image/png" sizes="32x32" href="./image-b.png">
          <link rel="manifest" href="./webmanifest.json">
          <link rel="mask-icon" href="./image-a.svg" color="#3f93ce">
          <link rel="stylesheet" href="./styles.css">
          <meta property="og:image" content="/image-social.png">
        </head>
        <body>
          <img src="./image-c.png" />
          <div>
            <img src="./image-b.svg" />
          </div>
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: rootDir,
      rootDir,
    });

    const assetsWithoutcontent = assets.map(a => ({ ...a, content: undefined }));
    assert.deepStrictEqual(assetsWithoutcontent, [
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-a.png'),
        hashed: false,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-b.png'),
        hashed: false,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'webmanifest.json'),
        hashed: false,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-a.svg'),
        hashed: false,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'styles.css'),
        hashed: true,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-social.png'),
        hashed: true,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-c.png'),
        hashed: true,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-b.svg'),
        hashed: true,
      },
    ]);
  });

  it('reads file sources', () => {
    const document = parse(`
      <html>
        <head>
          <link rel="manifest" href="./webmanifest.json">
          <link rel="mask-icon" href="./image-a.svg" color="#3f93ce">
          <link rel="stylesheet" href="./styles.css">
        </head>
        <body>

          <div>
            <img src="./image-b.svg" />
          </div>
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: rootDir,
      rootDir,
    });

    const transformedAssets = assets.map(asset => ({
      ...asset,
      content: asset.content.toString('utf-8').replace(/\s/g, ''),
    }));
    assert.deepStrictEqual(transformedAssets, [
      {
        content: '{"message":"helloworld"}',
        filePath: path.join(rootDir, 'webmanifest.json'),
        hashed: false,
      },
      {
        content:
          '<svgxmlns="http://www.w3.org/2000/svg"><pathd="M436124H12c-6.6270-12-5.373-12-12V80c0-6.627"></path></svg>',
        filePath: path.join(rootDir, 'image-a.svg'),
        hashed: false,
      },
      {
        content: ':root{color:blue;}',
        filePath: path.join(rootDir, 'styles.css'),
        hashed: true,
      },
      {
        content:
          '<svgxmlns="http://www.w3.org/2000/svg"><pathd="M7.7753.275a.75.750001.061.06l1.25-1.25a2"></path></svg>',
        filePath: path.join(rootDir, 'image-b.svg'),
        hashed: true,
      },
    ]);
  });

  it('handles paths into directories', () => {
    const document = parse(`
      <html>
        <body>
          <link rel="stylesheet" href="./foo/x.css">
          <link rel="stylesheet" href="./foo/bar/y.css">
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: rootDir,
      rootDir,
    });

    assert.strictEqual(assets.length, 2);
    assert.strictEqual(assets[0].filePath, path.join(rootDir, 'foo', 'x.css'));
    assert.strictEqual(assets[1].filePath, path.join(rootDir, 'foo', 'bar', 'y.css'));
    assert.strictEqual(assets[0].content.toString('utf-8').replace(/\s/g, ''), ':root{color:x;}');
    assert.strictEqual(assets[1].content.toString('utf-8').replace(/\s/g, ''), ':root{color:y;}');
  });

  it('resolves relative to HTML file location', () => {
    const document = parse(`
      <html>
        <body>
          <link rel="stylesheet" href="./x.css">
          <link rel="stylesheet" href="../styles.css">
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'foo', 'index.html'),
      htmlDir: path.join(rootDir, 'foo'),
      rootDir,
    });

    assert.strictEqual(assets.length, 2);
    assert.strictEqual(assets[0].filePath, path.join(rootDir, 'foo', 'x.css'));
    assert.strictEqual(assets[1].filePath, path.join(rootDir, 'styles.css'));
    assert.strictEqual(assets[0].content.toString('utf-8').replace(/\s/g, ''), ':root{color:x;}');
    assert.strictEqual(assets[1].content.toString('utf-8').replace(/\s/g, ''), ':root{color:blue;}');
  });

  it('resolves absolute paths relative to root dir', () => {
    const document = parse(`
      <html>
        <body>
          <link rel="stylesheet" href="/foo/x.css">
          <link rel="stylesheet" href="/styles.css">
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'foo', 'index.html'),
      htmlDir: path.join(rootDir, 'foo'),
      rootDir,
    });

    assert.strictEqual(assets.length, 2);
    assert.strictEqual(assets[0].filePath, path.join(rootDir, 'foo', 'x.css'));
    assert.strictEqual(assets[1].filePath, path.join(rootDir, 'styles.css'));
    assert.strictEqual(assets[0].content.toString('utf-8').replace(/\s/g, ''), ':root{color:x;}');
    assert.strictEqual(assets[1].content.toString('utf-8').replace(/\s/g, ''), ':root{color:blue;}');
  });

  it('can reference the same asset with a hashed and non-hashed node', () => {
    const document = parse(`
      <html>
        <body>
          <link rel="stylesheet" href="image-a.png">
          <link rel="icon" href="image-a.png">
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: rootDir,
      rootDir,
    });

    assert.strictEqual(assets.length, 2);
    const assetsWithoutcontent = assets.map(a => ({ ...a, content: undefined }));
    assert.deepStrictEqual(assetsWithoutcontent, [
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-a.png'),
        hashed: true,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-a.png'),
        hashed: false,
      },
    ]);
  });

  it('does not count remote URLs as assets', () => {
    const document = parse(`
      <html>
        <body>
          <link rel="stylesheet" href="https://fonts.googleapis.com/">
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'foo', 'index.html'),
      htmlDir: path.join(rootDir, 'foo'),
      rootDir,
    });

    assert.strictEqual(assets.length, 0);
  });

  it('does treat non module script tags as assets', () => {
    const document = parse(`
      <html>
        <body>
          <script src="./no-module.js"></script>
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: path.join(rootDir),
      rootDir,
    });

    assert.strictEqual(assets.length, 1);
    assert.strictEqual(assets[0].filePath, path.join(rootDir, 'no-module.js'));
    assert.strictEqual(assets[0].content.toString('utf-8'), '/* no module script file */\n');
  });

  it('handles a picture tag using source tags with srcset', () => {
    const document = parse(`
      <html>
        <body>
          <picture>
            <source
              type="image/avif"
              srcset="./images/eb26e6ca-30.avif 30w, /images/eb26e6ca-60.avif 60w"
              sizes="30px"
            />
            <source
              type="image/jpeg"
              srcset="./images/eb26e6ca-30.jpeg 30w, /images/eb26e6ca-60.jpeg 60w"
              sizes="30px"
            />
            <img
              alt="My Image Alternative Text"
              rocket-image="responsive"
              src="./images/eb26e6ca-30.jpeg"
              width="30"
              height="15"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: path.join(rootDir),
      rootDir,
    });

    // the <img> src is not the same as the small jpeg image
    assert.strictEqual(assets.length, 4);
    assert.strictEqual(assets[0].filePath, path.join(rootDir, 'images', 'eb26e6ca-30.avif'));
    assert.strictEqual(assets[1].filePath, path.join(rootDir, 'images', 'eb26e6ca-60.avif'));
    assert.strictEqual(assets[2].filePath, path.join(rootDir, 'images', 'eb26e6ca-30.jpeg'));
    assert.strictEqual(assets[3].filePath, path.join(rootDir, 'images', 'eb26e6ca-60.jpeg'));
  });
});
