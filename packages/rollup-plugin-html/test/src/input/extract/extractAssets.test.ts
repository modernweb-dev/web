import { expect } from 'chai';
import { parse } from 'parse5';
import path from 'path';
import { extractAssets } from '../../../../src/input/extract/extractAssets.js';
import { html, css, js, svg, createApp, cleanApp } from '../../../utils.js';

describe('extractAssets', () => {
  afterEach(() => {
    cleanApp();
  });

  it('extracts assets from a document', () => {
    const rootDir = createApp({
      'image-a.png': 'image-a.png',
      'image-b.png': 'image-b.png',
      'image-c.png': 'image-c.png',
      'image-a.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'image-b.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'image-c.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'styles.css': css`
        :root {
          color: blue;
        }
      `,
      'webmanifest.json': { message: 'hello world' },
    });

    const document = parse(html`
      <html>
        <head>
          <link rel="apple-touch-icon" sizes="180x180" href="./image-a.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="./image-b.png" />
          <link rel="manifest" href="./webmanifest.json" />
          <link rel="mask-icon" href="./image-a.svg" color="#3f93ce" />
          <link rel="stylesheet" href="./styles.css" />
          <meta property="og:image" content="/image-c.svg" />
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
      extractAssets: true,
    });

    const assetsWithoutcontent = assets.map(a => ({ ...a, content: undefined }));
    expect(assetsWithoutcontent).to.eql([
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-a.png'),
        hashed: true,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-b.png'),
        hashed: true,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'webmanifest.json'),
        hashed: true,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-a.svg'),
        hashed: true,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'styles.css'),
        hashed: true,
      },
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-c.svg'),
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
    const rootDir = createApp({
      'image-a.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'image-b.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'styles.css': css`
        :root {
          color: blue;
        }
      `,
      'webmanifest.json': { message: 'hello world' },
    });

    const document = parse(html`
      <html>
        <head>
          <link rel="manifest" href="./webmanifest.json" />
          <link rel="mask-icon" href="./image-a.svg" color="#3f93ce" />
          <link rel="stylesheet" href="./styles.css" />
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
      extractAssets: true,
    });

    const transformedAssets = assets.map(asset => ({
      ...asset,
      content: asset.content.toString('utf-8').replace(/\s/g, ''),
    }));
    expect(transformedAssets).to.eql([
      {
        content: '{"message":"helloworld"}',
        filePath: path.join(rootDir, 'webmanifest.json'),
        hashed: true,
      },
      {
        content: '<svgwidth="1"height="1"><rectwidth="1"height="1"fill="red"/></svg>',
        filePath: path.join(rootDir, 'image-a.svg'),
        hashed: true,
      },
      {
        content: ':root{color:blue;}',
        filePath: path.join(rootDir, 'styles.css'),
        hashed: true,
      },
      {
        content: '<svgwidth="1"height="1"><rectwidth="1"height="1"fill="green"/></svg>',
        filePath: path.join(rootDir, 'image-b.svg'),
        hashed: true,
      },
    ]);
  });

  it('handles paths into directories', () => {
    const rootDir = createApp({
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
    });

    const document = parse(html`
      <html>
        <body>
          <link rel="stylesheet" href="./foo/x.css" />
          <link rel="stylesheet" href="./foo/bar/y.css" />
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: rootDir,
      rootDir,
      extractAssets: true,
    });

    expect(assets.length).to.equal(2);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'foo', 'x.css'));
    expect(assets[1].filePath).to.equal(path.join(rootDir, 'foo', 'bar', 'y.css'));
    expect(assets[0].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:x;}');
    expect(assets[1].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:y;}');
  });

  it('resolves relative to HTML file location', () => {
    const rootDir = createApp({
      'foo/x.css': css`
        :root {
          color: x;
        }
      `,
      'styles.css': css`
        :root {
          color: blue;
        }
      `,
    });

    const document = parse(html`
      <html>
        <body>
          <link rel="stylesheet" href="./x.css" />
          <link rel="stylesheet" href="../styles.css" />
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'foo', 'index.html'),
      htmlDir: path.join(rootDir, 'foo'),
      rootDir,
      extractAssets: true,
    });

    expect(assets.length).to.equal(2);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'foo', 'x.css'));
    expect(assets[1].filePath).to.equal(path.join(rootDir, 'styles.css'));
    expect(assets[0].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:x;}');
    expect(assets[1].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:blue;}');
  });

  it('resolves absolute paths relative to root dir', () => {
    const rootDir = createApp({
      'foo/x.css': css`
        :root {
          color: x;
        }
      `,
      'styles.css': css`
        :root {
          color: blue;
        }
      `,
    });

    const document = parse(html`
      <html>
        <body>
          <link rel="stylesheet" href="/foo/x.css" />
          <link rel="stylesheet" href="/styles.css" />
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'foo', 'index.html'),
      htmlDir: path.join(rootDir, 'foo'),
      rootDir,
      extractAssets: true,
    });

    expect(assets.length).to.equal(2);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'foo', 'x.css'));
    expect(assets[1].filePath).to.equal(path.join(rootDir, 'styles.css'));
    expect(assets[0].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:x;}');
    expect(assets[1].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:blue;}');
  });

  it('can deduplicate assets with same names', () => {
    const rootDir = createApp({
      'image-a.png': 'image-a.png',
    });

    const document = parse(html`
      <html>
        <body>
          <link rel="apple-touch-icon" sizes="180x180" href="./image-a.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="image-a.png" />
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: rootDir,
      rootDir,
      extractAssets: true,
    });

    expect(assets.length).to.equal(1);
    const assetsWithoutcontent = assets.map(a => ({ ...a, content: undefined }));
    expect(assetsWithoutcontent).to.eql([
      {
        content: undefined,
        filePath: path.join(rootDir, 'image-a.png'),
        hashed: true,
      },
    ]);
  });

  it('does not count remote URLs as assets', () => {
    const rootDir = createApp({});

    const document = parse(html`
      <html>
        <body>
          <link rel="stylesheet" href="https://fonts.googleapis.com/" />
        </body>
      </html>
    `);
    const assets = extractAssets({
      document,
      htmlFilePath: path.join(rootDir, 'foo', 'index.html'),
      htmlDir: path.join(rootDir, 'foo'),
      rootDir,
      extractAssets: true,
    });

    expect(assets.length).to.equal(0);
  });

  it('does treat non module script tags as assets', () => {
    const rootDir = createApp({
      'no-module.js': js`/* no module script file */`,
    });

    const document = parse(html`
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
      extractAssets: true,
    });

    expect(assets.length).to.equal(1);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'no-module.js'));
    expect(assets[0].content.toString('utf-8')).to.equal('/* no module script file */\n');
  });

  it('handles a picture tag using source tags with srcset', () => {
    const rootDir = createApp({
      'images/eb26e6ca-30.avif': 'images/eb26e6ca-30.avif',
      'images/eb26e6ca-60.avif': 'images/eb26e6ca-60.avif',
      'images/eb26e6ca-30.jpeg': 'images/eb26e6ca-30.jpeg',
      'images/eb26e6ca-60.jpeg': 'images/eb26e6ca-60.jpeg',
    });

    const document = parse(html`
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
      extractAssets: true,
    });

    // the <img> src is not the same as the small jpeg image
    expect(assets.length).to.equal(4);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'images', 'eb26e6ca-30.avif'));
    expect(assets[1].filePath).to.equal(path.join(rootDir, 'images', 'eb26e6ca-60.avif'));
    expect(assets[2].filePath).to.equal(path.join(rootDir, 'images', 'eb26e6ca-30.jpeg'));
    expect(assets[3].filePath).to.equal(path.join(rootDir, 'images', 'eb26e6ca-60.jpeg'));
  });
});
