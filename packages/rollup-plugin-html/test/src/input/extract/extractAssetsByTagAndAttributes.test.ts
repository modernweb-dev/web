import { expect } from 'chai';
import { parse } from 'parse5';
import path from 'path';
import { extractAssets as ea } from '../../../../src/input/extract/extractAssets';

const rootDir = path.resolve(__dirname, '..', '..', '..', 'fixtures', 'assets');

describe('extractAssets by TagAndAttribute', () => {
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
          <my-el my-src="./image-c.png"></my-el>
          <div>
            <my-el my-src="./image-b.svg"></my-el>
        </div>
        </body>
      </html>
    `);
    const assets = ea({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: rootDir,
      rootDir,
      extractAssets: [{ tagName: 'my-el', attribute: 'my-src' }],
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
  it('extracts assets from two TagAndAttribute pairs a document', () => {
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
          <my-first-el my-src="./image-c.png"></my-first-el>
          <div>
            <my-second-el my-src="./image-b.svg"></my-second-el>
        </div>
        </body>
      </html>
    `);
    const assets = ea({
      document,
      htmlFilePath: path.join(rootDir, 'index.html'),
      htmlDir: rootDir,
      rootDir,
      extractAssets: [
        { tagName: 'my-first-el', attribute: 'my-src' },
        { tagName: 'my-second-el', attribute: 'my-src' },
      ],
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
});
