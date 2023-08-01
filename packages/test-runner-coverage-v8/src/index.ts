import { extname, join, isAbsolute, sep, posix } from 'path';
import { CoverageMapData } from 'istanbul-lib-coverage';
import v8toIstanbulLib from 'v8-to-istanbul';
import { TestRunnerCoreConfig, fetchSourceMap } from '@web/test-runner-core';
import { Profiler } from 'inspector';
import picoMatch from 'picomatch';
import LruCache from 'lru-cache';
import { readFile } from 'node:fs/promises';

import { toFilePath } from './utils';

type V8Coverage = Profiler.ScriptCoverage;
type Matcher = (test: string) => boolean;
type IstanbulSource = Required<Parameters<typeof v8toIstanbulLib>>[2];

const cachedMatchers = new Map<string, Matcher>();

// Cache the sourcemap/source objects to avoid repeatedly having to load
// them from disk per call
const cachedSources = new LruCache<string, IstanbulSource>({
  maxSize: 1024 * 1024 * 50,
  sizeCalculation: n => n.source.length,
});

// coverage base dir must be separated with "/"
const coverageBaseDir = process.cwd().split(sep).join('/');

function hasOriginalSource(source: IstanbulSource): boolean {
  return (
    'sourceMap' in source &&
    source.sourceMap !== undefined &&
    typeof source.sourceMap.sourcemap === 'object' &&
    source.sourceMap.sourcemap !== null &&
    Array.isArray(source.sourceMap.sourcemap.sourcesContent) &&
    source.sourceMap.sourcemap.sourcesContent.length > 0
  );
}

function getMatcher(patterns?: string[]) {
  if (!patterns || patterns.length === 0) {
    return () => true;
  }

  const key = patterns.join('');
  let matcher = cachedMatchers.get(key);
  if (!matcher) {
    const resolvedPatterns = patterns.map(pattern =>
      !isAbsolute(pattern) && !pattern.startsWith('*')
        ? posix.join(coverageBaseDir, pattern)
        : pattern,
    );
    matcher = picoMatch(resolvedPatterns);
    cachedMatchers.set(key, matcher);
  }
  return matcher;
}

export async function v8ToIstanbul(
  config: TestRunnerCoreConfig,
  testFiles: string[],
  coverage: V8Coverage[],
  userAgent?: string,
) {
  const included = getMatcher(config?.coverageConfig?.include);
  const excluded = getMatcher(config?.coverageConfig?.exclude);
  const istanbulCoverage: CoverageMapData = {};

  for (const entry of coverage) {
    const url = new URL(entry.url);
    const path = url.pathname;
    if (
      // ignore non-http protocols (for exmaple webpack://)
      url.protocol.startsWith('http') &&
      // ignore external urls
      url.hostname === config.hostname &&
      url.port === `${config.port}` &&
      // ignore non-files
      !!extname(path) &&
      // ignore virtual files
      !path.startsWith('/__web-test-runner') &&
      !path.startsWith('/__web-dev-server')
    ) {
      try {
        const filePath = join(config.rootDir, toFilePath(path));

        if (!testFiles.includes(filePath) && included(filePath) && !excluded(filePath)) {
          const browserUrl = `${url.pathname}${url.search}${url.hash}`;
          const cachedSource = cachedSources.get(browserUrl);
          const sources =
            cachedSource ??
            ((await fetchSourceMap({
              protocol: config.protocol,
              host: config.hostname,
              port: config.port,
              browserUrl,
              userAgent,
            })) as IstanbulSource);

          if (!cachedSource) {
            if (!hasOriginalSource(sources)) {
              const contents = await readFile(filePath, 'utf8');
              (sources as IstanbulSource & { originalSource: string }).originalSource = contents;
            }
            cachedSources.set(browserUrl, sources);
          }

          const converter = v8toIstanbulLib(filePath, 0, sources);
          await converter.load();

          converter.applyCoverage(entry.functions);
          Object.assign(istanbulCoverage, converter.toIstanbul());
        }
      } catch (error) {
        console.error(`Error while generating code coverage for ${entry.url}.`);
        console.error(error);
      }
    }
  }

  return istanbulCoverage;
}

export { V8Coverage };
