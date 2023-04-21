import { generateSW as _generateSw, injectManifest as _injectManifest } from 'workbox-build';
import type { GenerateSWOptions, InjectManifestOptions } from 'workbox-build';
import * as prettyBytes from 'pretty-bytes';
import * as rollup from 'rollup';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

interface RollupPartial {
  mode?: string | null;
}

type RollupInjectManifestOptions = InjectManifestOptions & RollupPartial;

const name = 'workbox';

const report = ({ swDest, count, size }: { swDest: string; count: number; size: number }) => {
  const prettySize = prettyBytes.default(size);

  console.log(`\nThe service worker file was written to ${swDest}`);
  console.log(`The service worker will precache ${count} URLs, totaling ${prettySize}.\n`);
};

export function generateSW(generateSWConfig: GenerateSWOptions, render = report) {
  const { swDest, globDirectory } = generateSWConfig;

  if (!swDest) throw new Error('No service worker destination specified');
  if (!globDirectory) throw new Error('No globDirectory specified');

  const doRender = ({
    count,
    size,
  }: {
    count: number;
    filePaths: string[];
    size: number;
    warnings: string[];
  }) => render({ swDest, count, size });

  return {
    name,
    writeBundle() {
      return _generateSw(generateSWConfig).then(doRender).catch(console.error);
    },
  };
}

export function injectManifest(
  { mode, ...injectManifestConfig }: RollupInjectManifestOptions,
  render = report,
) {
  const { swSrc, swDest, globDirectory } = injectManifestConfig;

  if (!swSrc) throw new Error('No service worker source specified');
  if (!swDest) throw new Error('No service worker destination specified');
  if (!globDirectory) throw new Error('No globDirectory specified');

  const doRender = ({
    count,
    size,
  }: {
    count: number;
    filePaths: string[];
    size: number;
    warnings: string[];
  }) => render({ swDest, count, size });

  return {
    name,
    writeBundle() {
      return _injectManifest(injectManifestConfig)
        .then(doRender)
        .then(async () => mode === 'production' && (await processBundle({ swDest })))
        .catch(console.error);
    },
  };
}

/**
 * @TODO
 * This is a hack to be able to support the `mode` property for `injectManifest` until Workbox decides to support it.
 * Feature is tracked here: https://github.com/GoogleChrome/workbox/issues/2588
 * Once Workbox's `injectManifest` supports this out of the box, we should remove this.
 */
const processBundle = async ({ swDest }: { swDest: string }) => {
  const bundle = await rollup.rollup({
    input: swDest,
    plugins: [
      replace({ 'process.env.NODE_ENV': '"production"' }) as rollup.Plugin,
      resolve(),
      terser({ output: { comments: false } }),
    ],
  });
  await bundle.write({
    file: swDest,
    format: 'iife',
  });
};
