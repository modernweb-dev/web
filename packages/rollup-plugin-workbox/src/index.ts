import { generateSW as _generateSw, injectManifest as _injectManifest } from 'workbox-build';
import type { GenerateSWOptions, InjectManifestOptions } from 'workbox-build';
import * as prettyBytes from 'pretty-bytes';
import * as esbuild from 'esbuild';
import type { BuildOptions } from 'esbuild';

const name = 'workbox';

const report = ({ swDest, count, size }: { swDest: string; count: number; size: number }) => {
  const prettySize = prettyBytes.default(size);

  console.log(`\nThe service worker file was written to ${swDest}`);
  console.log(`The service worker will precache ${count} URLs, totaling ${prettySize}.\n`);
};

export function generateSW(generateSWConfig: GenerateSWOptions, { render = report } = {}) {
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
  injectManifestConfig: InjectManifestOptions,
  {
    render = report,
    esbuild: esbuildOptions,
  }: { render?: typeof report; esbuild?: BuildOptions } = {},
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
    async writeBundle() {
      await esbuild.build({
        bundle: true,
        minify: true,
        format: 'iife',
        ...esbuildOptions,
        entryPoints: [swSrc],
        outfile: swDest,
      });

      injectManifestConfig.swSrc = swDest;
      return _injectManifest(injectManifestConfig).then(doRender).catch(console.error);
    },
  };
}
