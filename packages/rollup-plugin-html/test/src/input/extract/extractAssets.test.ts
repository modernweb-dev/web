import { expect } from 'chai';
import { parse } from 'parse5';
import path from 'path';
import { extractAssets } from '../../../../src/input/extract/extractAssets.js';

const rootDir = path.resolve(__dirname, '..', '..', '..', 'fixtures', 'assets');

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
    expect(assetsWithoutcontent).to.eql([
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
    expect(transformedAssets).to.eql([
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

    expect(assets.length).to.equal(2);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'foo', 'x.css'));
    expect(assets[1].filePath).to.equal(path.join(rootDir, 'foo', 'bar', 'y.css'));
    expect(assets[0].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:x;}');
    expect(assets[1].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:y;}');
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

    expect(assets.length).to.equal(2);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'foo', 'x.css'));
    expect(assets[1].filePath).to.equal(path.join(rootDir, 'styles.css'));
    expect(assets[0].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:x;}');
    expect(assets[1].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:blue;}');
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

    expect(assets.length).to.equal(2);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'foo', 'x.css'));
    expect(assets[1].filePath).to.equal(path.join(rootDir, 'styles.css'));
    expect(assets[0].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:x;}');
    expect(assets[1].content.toString('utf-8').replace(/\s/g, '')).to.equal(':root{color:blue;}');
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

    expect(assets.length).to.equal(2);
    const assetsWithoutcontent = assets.map(a => ({ ...a, content: undefined }));
    expect(assetsWithoutcontent).to.eql([
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

    expect(assets.length).to.equal(0);
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

    expect(assets.length).to.equal(1);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'no-module.js'));
    expect(assets[0].content.toString('utf-8')).to.equal('/* no module script file */\n');
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
    expect(assets.length).to.equal(4);
    expect(assets[0].filePath).to.equal(path.join(rootDir, 'images', 'eb26e6ca-30.avif'));
    expect(assets[1].filePath).to.equal(path.join(rootDir, 'images', 'eb26e6ca-60.avif'));
    expect(assets[2].filePath).to.equal(path.join(rootDir, 'images', 'eb26e6ca-30.jpeg'));
    expect(assets[3].filePath).to.equal(path.join(rootDir, 'images', 'eb26e6ca-60.jpeg'));
  });
});
