import { expect } from 'chai';
import path from 'path';
import { parse, serialize } from 'parse5';
import { html } from '../../utils.js';
import { InputData } from '../../../src/input/InputData.js';

import { injectUpdatedAssetPaths } from '../../../src/output/injectUpdatedAssetPaths.js';

describe('injectUpdatedAssetPaths()', () => {
  it('injects updated asset paths', () => {
    const document = parse(html`
      <html>
        <head>
          <link rel="stylesheet" href="./styles.css" />
        </head>
        <body>
          <img src="./foo/image-a.png" />
          <img src="/image-b.png" />
          <script src="/no-module.js"></script>
        </body>
      </html>
    `);

    const input: InputData = {
      html: '',
      name: 'index.html',
      moduleImports: [],
      inlineModules: [],
      assets: [],
      filePath: '/root/index.html',
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'no-module.js'), 'no-module-xxx.js');

    injectUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });

    const result = serialize(document);

    expect(html`${result}`).to.eql(html`
      <html>
        <head>
          <link rel="stylesheet" href="styles-xxx.css" />
        </head>
        <body>
          <img src="image-a-xxx.png" />
          <img src="image-b-xxx.png" />
          <script src="no-module-xxx.js"></script>
        </body>
      </html>
    `);
  });

  it('handles a picture tag using source tags with srcset', () => {
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

    const input: InputData = {
      html: '',
      name: 'index.html',
      moduleImports: [],
      inlineModules: [],
      assets: [],
      filePath: '/root/index.html',
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'images', 'eb26e6ca-30.avif'), 'eb26e6ca-30-xxx.avif');
    hashed.set(path.join(path.sep, 'root', 'images', 'eb26e6ca-60.avif'), 'eb26e6ca-60-xxx.avif');
    hashed.set(path.join(path.sep, 'root', 'images', 'eb26e6ca-30.jpeg'), 'eb26e6ca-30-xxx.jpeg');
    hashed.set(path.join(path.sep, 'root', 'images', 'eb26e6ca-60.jpeg'), 'eb26e6ca-60-xxx.jpeg');

    injectUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });

    const result = serialize(document);

    expect(html`${result}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <picture>
            <source
              type="image/avif"
              srcset="eb26e6ca-30-xxx.avif 30w, eb26e6ca-60-xxx.avif 60w"
              sizes="30px"
            />
            <source
              type="image/jpeg"
              srcset="eb26e6ca-30-xxx.jpeg 30w, eb26e6ca-60-xxx.jpeg 60w"
              sizes="30px"
            />
            <img
              alt="My Image Alternative Text"
              rocket-image="responsive"
              src="eb26e6ca-30-xxx.jpeg"
              width="30"
              height="15"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </body>
      </html>
    `);
  });

  it('handles video tag using source tags with src', () => {
    const document = parse(html`
      <html>
        <body>
          <video controls>
            <source src="./videos/typer-hydration.mp4" type="video/mp4" />
          </video>
        </body>
      </html>
    `);

    const input: InputData = {
      html: '',
      name: 'index.html',
      moduleImports: [],
      inlineModules: [],
      assets: [],
      filePath: '/root/index.html',
    };
    const hashed = new Map<string, string>();
    hashed.set(
      path.join(path.sep, 'root', 'videos', 'typer-hydration.mp4'),
      'typer-hydration-xxx.mp4',
    );

    injectUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });

    const result = serialize(document);

    expect(html`${result}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <video controls="">
            <source src="typer-hydration-xxx.mp4" type="video/mp4" />
          </video>
        </body>
      </html>
    `);
  });

  it('handles virtual files', () => {
    const document = parse(html`
      <html>
        <head>
          <link rel="stylesheet" href="./styles.css" />
        </head>
        <body>
          <img src="./foo/image-a.png" />
          <img src="/image-b.png" />
        </body>
      </html>
    `);

    const input: InputData = {
      html: '',
      name: 'index.html',
      moduleImports: [],
      inlineModules: [],
      assets: [],
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');

    injectUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });

    const result = serialize(document);

    expect(html`${result}`).to.eql(html`
      <html>
        <head>
          <link rel="stylesheet" href="styles-xxx.css" />
        </head>
        <body>
          <img src="image-a-xxx.png" />
          <img src="image-b-xxx.png" />
        </body>
      </html>
    `);
  });

  it('handles HTML files in a sub directory', () => {
    const document = parse(html`
      <html>
        <head>
          <link rel="stylesheet" href="../styles.css" />
        </head>
        <body>
          <img src="./image-a.png" />
          <img src="/image-b.png" />
        </body>
      </html>
    `);

    const input: InputData = {
      html: '',
      name: 'foo/index.html',
      moduleImports: [],
      inlineModules: [],
      assets: [],
      filePath: '/root/foo/index.html',
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');

    injectUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });

    const result = serialize(document);

    expect(html`${result}`).to.eql(html`
      <html>
        <head>
          <link rel="stylesheet" href="../styles-xxx.css" />
        </head>
        <body>
          <img src="../image-a-xxx.png" />
          <img src="../image-b-xxx.png" />
        </body>
      </html>
    `);
  });

  it('handles virtual HTML files in a sub directory', () => {
    const document = parse(html`
      <html>
        <head>
          <link rel="stylesheet" href="../styles.css" />
        </head>
        <body>
          <img src="./image-a.png" />
          <img src="/image-b.png" />
        </body>
      </html>
    `);

    const input: InputData = {
      html: '',
      name: 'foo/index.html',
      moduleImports: [],
      inlineModules: [],
      assets: [],
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');

    injectUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
    });

    const result = serialize(document);

    expect(html`${result}`).to.eql(html`
      <html>
        <head>
          <link rel="stylesheet" href="../styles-xxx.css" />
        </head>
        <body>
          <img src="../image-a-xxx.png" />
          <img src="../image-b-xxx.png" />
        </body>
      </html>
    `);
  });

  it('prefixes a publicpath', () => {
    const document = parse(html`
      <html>
        <head>
          <link rel="stylesheet" href="./styles.css" />
        </head>
        <body>
          <img src="./foo/image-a.png" />
          <img src="/image-b.png" />
        </body>
      </html>
    `);

    const input: InputData = {
      html: '',
      name: 'index.html',
      moduleImports: [],
      inlineModules: [],
      assets: [],
      filePath: '/root/index.html',
    };
    const hashed = new Map<string, string>();
    hashed.set(path.join(path.sep, 'root', 'styles.css'), 'styles-xxx.css');
    hashed.set(path.join(path.sep, 'root', 'foo', 'image-a.png'), 'image-a-xxx.png');
    hashed.set(path.join(path.sep, 'root', 'image-b.png'), 'image-b-xxx.png');

    injectUpdatedAssetPaths({
      document,
      input,
      outputDir: '/root/dist/',
      rootDir: '/root/',
      emittedAssets: { static: new Map(), hashed },
      publicPath: './public/',
    });

    const result = serialize(document);

    expect(html`${result}`).to.eql(html`
      <html>
        <head>
          <link rel="stylesheet" href="public/styles-xxx.css" />
        </head>
        <body>
          <img src="public/image-a-xxx.png" />
          <img src="public/image-b-xxx.png" />
        </body>
      </html>
    `);
  });
});
