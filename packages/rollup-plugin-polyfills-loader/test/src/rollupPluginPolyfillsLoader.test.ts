/* eslint-disable no-await-in-loop */
import { OutputChunk, rollup, OutputAsset, RollupOptions, OutputOptions } from 'rollup';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import html from '@web/rollup-plugin-html';
import polyfillsLoader from '../../src/index';

type Output = (OutputChunk | OutputAsset)[];

const relativeUrl = `./${path.relative(process.cwd(), path.join(__dirname, '..'))}`;

const updateSnapshots = process.argv.includes('--update-snapshots');

function getAsset(output: Output, name: string) {
  return output.find(o => o.fileName === name && o.type === 'asset') as OutputAsset & {
    source: string;
  };
}

interface SnapshotArgs {
  name: string;
  fileName: string;
  inputOptions: RollupOptions;
  outputOptions: OutputOptions[];
}

async function testSnapshot({ name, fileName, inputOptions, outputOptions }: SnapshotArgs) {
  const snapshotPath = path.join(__dirname, '..', 'snapshots', `${name}.html`);
  const bundle = await rollup(inputOptions);
  let output;
  for (const outputConfig of outputOptions) {
    ({ output } = await bundle.generate(outputConfig));
  }

  if (!output) throw new Error('');

  const file = getAsset(output, fileName);
  if (!file) throw new Error(`Build did not output ${fileName}`);

  if (updateSnapshots) {
    fs.writeFileSync(snapshotPath, file.source, 'utf-8');
  } else {
    const snapshot = fs.readFileSync(snapshotPath, 'utf-8');
    expect(file.source.replace(/\s/g, '')).to.equal(snapshot.replace(/\s/g, ''));
  }
  return output;
}

const defaultOutputOptions: OutputOptions[] = [
  {
    format: 'es',
    dir: 'dist',
  },
];

describe('rollup-plugin-polyfills-loader', function describe() {
  // bootup of the first test can take a long time in CI to load all the polyfills
  this.timeout(5000);

  it('can inject a polyfills loader with a single output', async () => {
    const inputOptions: RollupOptions = {
      plugins: [
        html({
          input: {
            html: `<script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js"></script>`,
          },
        }),
        polyfillsLoader({
          polyfills: { hash: false, fetch: true },
        }),
      ],
    };

    await testSnapshot({
      name: 'single-output',
      fileName: 'index.html',
      inputOptions,
      outputOptions: defaultOutputOptions,
    });
  });

  it('can set polyfills to load', async () => {
    const inputOptions = {
      plugins: [
        html({
          input: {
            html: `<script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js"></script>`,
          },
        }),
        polyfillsLoader({
          polyfills: {
            hash: false,
            webcomponents: true,
            fetch: true,
          },
        }),
      ],
    };

    const output = await testSnapshot({
      name: 'polyfills',
      fileName: 'index.html',
      inputOptions,
      outputOptions: defaultOutputOptions,
    });

    expect(output.find(o => o.fileName.startsWith('polyfills/webcomponents'))).to.exist;
    expect(output.find(o => o.fileName.startsWith('polyfills/fetch'))).to.exist;
  });

  it('can inject with multiple build outputs', async () => {
    const htmlPlugin = html({
      input: {
        html: `<script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js"></script>`,
      },
    });
    const inputOptions = {
      plugins: [
        htmlPlugin,
        polyfillsLoader({
          modernOutput: { name: 'modern' },
          legacyOutput: [{ name: 'legacy', test: "!('noModule' in HTMLScriptElement.prototype)" }],
          polyfills: { hash: false, webcomponents: true, fetch: true },
        }),
      ],
    };

    const outputOptions: OutputOptions[] = [
      {
        format: 'system',
        dir: 'dist',
        plugins: [htmlPlugin.api.addOutput('legacy')],
      },
      {
        format: 'es',
        dir: 'dist',
        plugins: [htmlPlugin.api.addOutput('modern')],
      },
    ];

    await testSnapshot({
      name: 'multiple-outputs',
      fileName: 'index.html',
      inputOptions,
      outputOptions,
    });
  });

  it('can customize the file type', async () => {
    const htmlPlugin = html({
      input: {
        html: `<script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js"></script>`,
      },
    });
    const inputOptions = {
      plugins: [
        htmlPlugin,
        polyfillsLoader({
          modernOutput: { name: 'modern', type: 'script' },
          legacyOutput: [
            {
              name: 'legacy',
              type: 'script',
              test: "!('noModule' in HTMLScriptElement.prototype)",
            },
          ],
          polyfills: { hash: false, webcomponents: true, fetch: true },
        }),
      ],
    };

    const outputOptions: OutputOptions[] = [
      {
        format: 'system',
        dir: 'dist',
        plugins: [htmlPlugin.api.addOutput('legacy')],
      },
      {
        format: 'es',
        dir: 'dist',
        plugins: [htmlPlugin.api.addOutput('modern')],
      },
    ];

    await testSnapshot({
      name: 'customize-filetype',
      fileName: 'index.html',
      inputOptions,
      outputOptions,
    });
  });

  it('a regular module script is added when no polyfills need to be loaded', async () => {
    const inputOptions = {
      plugins: [
        html({
          input: {
            html: `<script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js"></script>`,
          },
        }),
        polyfillsLoader(),
      ],
    };

    await testSnapshot({
      name: 'no-polyfills',
      fileName: 'index.html',
      inputOptions,
      outputOptions: defaultOutputOptions,
    });
  });
});
