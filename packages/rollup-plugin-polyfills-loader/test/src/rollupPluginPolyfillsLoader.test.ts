/* eslint-disable no-await-in-loop */
import { OutputChunk, rollup, OutputAsset, RollupOptions, OutputOptions } from 'rollup';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import polyfillsLoader from '../../src/index.js';

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
    expect(file.source.trim()).to.equal(snapshot.trim());
    // expect(file.source.replace(/\s/g, '')).to.equal(snapshot.replace(/\s/g, ''));
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

  it('can inject a polyfills loader with multiple entrypoints', async () => {
    const inputOptions: RollupOptions = {
      plugins: [
        html({
          input: {
            html: `
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js"></script>
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-b.js"></script>`,
          },
        }),
        polyfillsLoader({
          polyfills: { hash: false, fetch: true },
        }),
      ],
    };

    await testSnapshot({
      name: 'multiple-entrypoints',
      fileName: 'index.html',
      inputOptions,
      outputOptions: defaultOutputOptions,
    });
  });

  it('retains attributes on script tags when injecting a polyfills loader with multiple entrypoints', async () => {
    const inputOptions: RollupOptions = {
      plugins: [
        html({
          input: {
            html: `
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js" keep-this-attribute></script>
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-b.js"></script>`,
          },
        }),
        polyfillsLoader({
          polyfills: { hash: false, fetch: true },
        }),
      ],
    };

    await testSnapshot({
      name: 'multiple-entrypoints-retain-attributes',
      fileName: 'index.html',
      inputOptions,
      outputOptions: defaultOutputOptions,
    });
  });

  it('can inject a polyfills loader with non-flat inputs, flattenOutput: true', async () => {
    const inputOptions: RollupOptions = {
      plugins: [
        html({
          rootDir: `${relativeUrl}/fixtures/`,
          input: `non-flat/index.html`,
          flattenOutput: true,
        }),
        polyfillsLoader({
          polyfills: { hash: false, fetch: true },
        }),
      ],
    };

    await testSnapshot({
      name: 'flattened',
      fileName: `index.html`,
      inputOptions,
      outputOptions: defaultOutputOptions,
    });
  });

  it('can inject a polyfills loader with non-flat inputs, flattenOutput: false', async () => {
    const inputOptions: RollupOptions = {
      plugins: [
        html({
          rootDir: `${relativeUrl}/fixtures/`,
          input: `non-flat/index.html`,
          flattenOutput: false,
        }),
        polyfillsLoader({
          polyfills: { hash: false, fetch: true },
        }),
      ],
    };

    await testSnapshot({
      name: 'non-flattened',
      fileName: path.normalize(`non-flat/index.html`),
      inputOptions,
      outputOptions: defaultOutputOptions,
    });
  });

  it('injects the correct preload for systemjs output', async () => {
    const inputOptions: RollupOptions = {
      plugins: [
        html({
          input: {
            html: `
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js"></script>
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-b.js"></script>`,
          },
        }),
        polyfillsLoader(),
      ],
    };

    await testSnapshot({
      name: 'systemjs',
      fileName: 'index.html',
      inputOptions,
      outputOptions: [
        {
          format: 'system',
          dir: 'dist',
        },
      ],
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
          modernOutput: { name: 'modern', type: 'systemjs' },
          polyfills: { hash: false, webcomponents: true, fetch: true },
        }),
      ],
    };

    const outputOptions: OutputOptions[] = [
      {
        format: 'es',
        dir: 'dist',
      },
    ];

    await testSnapshot({
      name: 'customize-filetype',
      fileName: 'index.html',
      inputOptions,
      outputOptions,
    });
  });

  it('can customize the file type for multiple outputs', async () => {
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
      name: 'customize-filetype-multi-output',
      fileName: 'index.html',
      inputOptions,
      outputOptions,
    });
  });

  it('injects preload when there are no polyfills to inject', async () => {
    const inputOptions: RollupOptions = {
      plugins: [
        html({
          input: {
            html: `
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js"></script>
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-b.js"></script>`,
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

  it('will retain attributes of script tags if there are no polyfills to inject', async () => {
    const inputOptions: RollupOptions = {
      plugins: [
        html({
          input: {
            html: `
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js" keep-this-attribute></script>
            <script type="module" src="${relativeUrl}/fixtures/entrypoint-b.js"></script>`,
          },
        }),
        polyfillsLoader(),
      ],
    };

    await testSnapshot({
      name: 'no-polyfills-retain-attributes',
      fileName: 'index.html',
      inputOptions,
      outputOptions: defaultOutputOptions,
    });
  });

  it('can inject a polyfills loader as an external script', async () => {
    const inputOptions: RollupOptions = {
      plugins: [
        html({
          input: {
            html: `<script type="module" src="${relativeUrl}/fixtures/entrypoint-a.js"></script>`,
          },
        }),
        polyfillsLoader({
          polyfills: { hash: false, fetch: true },
          externalLoaderScript: true,
        }),
      ],
    };

    await testSnapshot({
      name: 'external-script',
      fileName: 'index.html',
      inputOptions,
      outputOptions: defaultOutputOptions,
    });
  });
});
