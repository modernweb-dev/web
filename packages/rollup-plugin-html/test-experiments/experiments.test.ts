import synchronizedPrettier from '@prettier/sync';
import * as prettier from 'prettier';
import { rollup, OutputChunk, OutputOptions, Plugin, RollupBuild } from 'rollup';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import { rollupPluginHTML } from '../src/index.js';

// TODO: test output "fileName" too, like the real output name, not always it's properly checked besides checking the index.html source

function collapseWhitespaceAll(str: string) {
  return (
    str &&
    str.replace(/[ \n\r\t\f\xA0]+/g, spaces => {
      return spaces === '\t' ? '\t' : spaces.replace(/(^|\xA0+)[^\xA0]+/g, '$1 ');
    })
  );
}

function format(str: string, parser: prettier.BuiltInParserName) {
  return synchronizedPrettier.format(str, { parser, semi: true, singleQuote: true });
}

function merge(strings: TemplateStringsArray, ...values: string[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
}

const extnameToFormatter: Record<string, (str: string) => string> = {
  '.html': (str: string) => format(collapseWhitespaceAll(str), 'html'),
  '.css': (str: string) => format(str, 'css'),
  '.js': (str: string) => format(str, 'typescript'),
  '.json': (str: string) => format(str, 'json'),
  '.svg': (str: string) => format(collapseWhitespaceAll(str), 'html'),
};

function getFormatterFromFilename(name: string): undefined | ((str: string) => string) {
  return extnameToFormatter[path.extname(name)];
}

const html = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.html'](merge(strings, ...values));

const css = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.css'](merge(strings, ...values));

const js = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.js'](merge(strings, ...values));

const svg = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.svg'](merge(strings, ...values));

const outputConfig: OutputOptions = {
  format: 'es',
  dir: 'dist',
};

async function generateTestBundle(build: RollupBuild, outputConfig: OutputOptions) {
  const { output } = await build.generate(outputConfig);
  const chunks: Record<string, string> = {};
  const assets: Record<string, string | Uint8Array> = {};

  for (const file of output) {
    const filename = file.fileName;
    const formatter = getFormatterFromFilename(filename);
    if (file.type === 'chunk') {
      chunks[filename] = formatter ? formatter(file.code) : file.code;
    } else if (file.type === 'asset') {
      let code = file.source;
      if (typeof code !== 'string' && filename.endsWith('.css')) {
        code = Buffer.from(code).toString('utf8');
      }
      if (typeof code === 'string' && formatter) {
        code = formatter(code);
      }
      assets[filename] = code;
    }
  }

  return { output, chunks, assets };
}

function createApp(structure: Record<string, string | Buffer | object>) {
  const timestamp = Date.now();
  const rootDir = path.join(__dirname, `./.tmp/app-${timestamp}`);
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
  Object.keys(structure).forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(fullPath)) {
      const content = structure[filePath];
      const contentForWrite =
        typeof content === 'object' && !(content instanceof Buffer)
          ? JSON.stringify(content)
          : content;
      fs.writeFileSync(fullPath, contentForWrite);
    }
  });
  return rootDir;
}

function cleanApp() {
  const tmpDir = path.join(__dirname, './.tmp');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }
}

describe('rollup-plugin-html', () => {
  afterEach(() => {
    cleanApp();
  });

  it('hashes all assets using assetFileNames', async () => {
    const rootDir = createApp({
      'node_modules/ing-web/fonts/font.woff2': 'font.woff',
      'node_modules/ing-web/global.css': css`
        @font-face {
          font-family: Font;
          src: url('fonts/font.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `,
      'assets/images/image.png': 'image.png',
      'assets/styles.css': css`
        #a {
          background-image: url('images/image.png');
        }
      `,
      'src/main.js': js`
        const imageUrl = new URL('../assets/images/image.png', import.meta.url).href;
      `,
      'index.html': html`
        <html>
          <head>
            <link rel="stylesheet" href="./node_modules/ing-web/global.css" />
            <link rel="stylesheet" href="./assets/styles.css" />
            <link
              rel="preload"
              href="./node_modules/ing-web/fonts/font.woff2"
              as="font"
              type="font/woff2"
            />
          </head>
          <body>
            <img src="./assets/images/image.png" />
          </body>
        </html>
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: './index.html',
        }),
      ],
    };

    const build = await rollup(config);
    const { output, assets } = await generateTestBundle(build, {
      ...outputConfig,
      assetFileNames: 'static/[name].immutable.[hash][extname]',
    });

    expect(assets).to.have.keys([
      'static/font.immutable.C5MNjX-h.woff2',
      'static/global.immutable.DB0fKkjs.css',
      'static/image.immutable.7xJLr_7N.png',
      'static/styles.immutable.D4tZXVv0.css',
      'index.html',
    ]);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="stylesheet" href="static/global.immutable.DB0fKkjs.css" />
          <link rel="stylesheet" href="static/styles.immutable.D4tZXVv0.css" />
          <link
            rel="preload"
            href="static/font.immutable.C5MNjX-h.woff2"
            as="font"
            type="font/woff2"
          />
        </head>
        <body>
          <img src="static/image.immutable.7xJLr_7N.png" />
        </body>
      </html>
    `);

    expect(assets['static/global.immutable.DB0fKkjs.css']).to.equal(css`
      @font-face {
        font-family: Font;
        src: url('font.immutable.C5MNjX-h.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `);

    expect(assets['static/styles.immutable.D4tZXVv0.css']).to.equal(css`
      #a {
        background-image: url('image.immutable.7xJLr_7N.png');
      }
    `);
  });

  it('correctly resolves paths by using publicPath when assetFileNames puts assets in different dirs', async () => {
    const rootDir = createApp({
      'node_modules/ing-web/fonts/font.woff2': 'font.woff',
      'node_modules/ing-web/global.css': css`
        @font-face {
          font-family: Font;
          src: url('fonts/font.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `,
      'assets/images/image.png': 'image.png',
      'assets/styles.css': css`
        #a {
          background-image: url('images/image.png');
        }
      `,
      'src/main.js': js`
        const imageUrl = new URL('../assets/images/image.png', import.meta.url).href;
      `,
      'index.html': html`
        <html>
          <head>
            <link rel="stylesheet" href="./node_modules/ing-web/global.css" />
            <link rel="stylesheet" href="./assets/styles.css" />
            <link
              rel="preload"
              href="./node_modules/ing-web/fonts/font.woff2"
              as="font"
              type="font/woff2"
            />
          </head>
          <body>
            <img src="./assets/images/image.png" />
          </body>
        </html>
      `,
    });

    const config = {
      plugins: [
        rollupPluginHTML({
          rootDir,
          input: './index.html',
          publicPath: '/static/',
        }),
      ],
    };

    const build = await rollup(config);
    const { output, assets } = await generateTestBundle(build, {
      ...outputConfig,
      assetFileNames: assetInfo => {
        const name = assetInfo.names[0] || '';
        if (name.endsWith('.woff2')) {
          return 'fonts/[name].immutable.[hash][extname]';
        } else if (name.endsWith('.css')) {
          return 'styles/[name].immutable.[hash][extname]';
        } else if (name.endsWith('.png')) {
          return 'images/[name].immutable.[hash][extname]';
        }
        return '[name].immutable.[hash][extname]';
      },
    });

    expect(assets).to.have.keys([
      'fonts/font.immutable.C5MNjX-h.woff2',
      'styles/global.immutable.B3Q0ucg4.css',
      'images/image.immutable.7xJLr_7N.png',
      'styles/styles.immutable.C3Z0Fs2-.css',
      'index.html',
    ]);

    expect(assets['index.html']).to.equal(html`
      <html>
        <head>
          <link rel="stylesheet" href="/static/styles/global.immutable.B3Q0ucg4.css" />
          <link rel="stylesheet" href="/static/styles/styles.immutable.C3Z0Fs2-.css" />
          <link
            rel="preload"
            href="/static/fonts/font.immutable.C5MNjX-h.woff2"
            as="font"
            type="font/woff2"
          />
        </head>
        <body>
          <img src="/static/images/image.immutable.7xJLr_7N.png" />
        </body>
      </html>
    `);

    expect(assets['styles/global.immutable.B3Q0ucg4.css']).to.equal(css`
      @font-face {
        font-family: Font;
        src: url('/static/fonts/font.immutable.C5MNjX-h.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `);

    expect(assets['styles/styles.immutable.C3Z0Fs2-.css']).to.equal(css`
      #a {
        background-image: url('/static/images/image.immutable.7xJLr_7N.png');
      }
    `);
  });
});
