import { extname, join, isAbsolute, sep, posix } from 'node:path';
import { CoverageMapData } from 'istanbul-lib-coverage';
import v8toIstanbulLib from 'v8-to-istanbul';
import { TestRunnerCoreConfig, fetchSourceMap } from '@web/test-runner-core';
import { Profiler } from 'inspector';
import picoMatch from 'picomatch';
import LruCache from 'lru-cache';
import { readFile, readdir, stat } from 'node:fs/promises';
import { Stats } from 'node:fs';
import { toFilePath, toBrowserPath } from './utils.js';

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
    source.sourceMap.sourcemap.sourcesContent.length > 0);
}

function getMatcher(patterns?: string[]): picoMatch.Matcher {
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
): Promise<CoverageMapData> {
  const included = getMatcher(config?.coverageConfig?.include);
  const excluded = getMatcher(config?.coverageConfig?.exclude);
  const istanbulCoverage: CoverageMapData = {};

  for (const entry of coverage) {
    try {
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
        const filePath = join(config.rootDir, toFilePath(path));
        if (!testFiles.includes(filePath) && included(filePath) && !excluded(filePath)) {
          const browserUrl = `${url.pathname}${url.search}${url.hash}`;
          const sources = await getIstanbulSource(config, filePath, browserUrl, userAgent);
          await addCoverageForFilePath(sources, filePath, entry, istanbulCoverage);
        }
      }
    } catch (error) {
      console.error(`Error while generating code coverage for ${entry.url}.`);
      console.error(error);
    }
  }

  return istanbulCoverage;
}

async function addCoverageForFilePath(
  sources: IstanbulSource,
  filePath: string,
  entry: V8Coverage,
  istanbulCoverage: CoverageMapData,
): Promise<void> {
  const converter = v8toIstanbulLib(filePath, 0, sources);
  await converter.load();

  converter.applyCoverage(entry.functions);
  Object.assign(istanbulCoverage, converter.toIstanbul());
}

async function getIstanbulSource(
  config: TestRunnerCoreConfig,
  filePath: string,
  browserUrl: string,
  userAgent?: string,
  doNotAddToCache?: boolean,
): Promise<IstanbulSource> {
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
    !doNotAddToCache && cachedSources.set(browserUrl, sources);
  }
  return sources;
}


async function recursivelyAddEmptyReports(
  config: TestRunnerCoreConfig,
  testFiles: string[],
  include: picoMatch.Matcher,
  exclude: picoMatch.Matcher,
  istanbulCoverage: CoverageMapData,
  dir = '',
): Promise<void> {
  const contents = await readdir(join(coverageBaseDir, dir));
  for (const file of contents) {
    const filePath = join(coverageBaseDir, dir, file);
    if (!exclude(filePath)) {
      const stats = await stat(filePath);
      const relativePath = join(dir, file);
      if (stats.isDirectory()) {
        await recursivelyAddEmptyReports(config, testFiles, include, exclude, istanbulCoverage, relativePath);
      } else if (!testFiles.includes(filePath) && include(filePath)) {
        await addEmptyReportIfFileUntouched(config, istanbulCoverage, filePath, stats, relativePath);
      }
    }
  }
}

async function addEmptyReportIfFileUntouched(
  config: TestRunnerCoreConfig,
  istanbulCoverage: CoverageMapData,
  filePath: string,
  stats: Stats,
  relativePath: string,
): Promise<void> {
  try {
    const browserUrl = toBrowserPath(relativePath);
    const fileHasBeenTouched = cachedSources.find((_, key) => {
      return key === browserUrl || key.startsWith(browserUrl+'?') || key.startsWith(browserUrl+'#');
    });
    if (fileHasBeenTouched) {
      return;
    }
    const sources = await getIstanbulSource(config, filePath, browserUrl, undefined, true);
    const entry = {
      scriptId: browserUrl,
      url: browserUrl,
      functions: [{
        functionName: '(empty-report)',
        isBlockCoverage: true,
        ranges: [{
          startOffset: 0,
          endOffset: stats.size,
          count: 0
        }]
      }]
    } as V8Coverage;
    await addCoverageForFilePath(sources, filePath, entry, istanbulCoverage);
  } catch (error) {
    console.error(`Error while generating empty code coverage for ${filePath}.`);
    console.error(error);
  }
}

export async function generateEmptyReportsForUntouchedFiles(
  config: TestRunnerCoreConfig,
  testFiles: string[],
): Promise<CoverageMapData> {
  const istanbulCoverage: CoverageMapData = {};
  if (config?.coverageConfig) {
    const include = getMatcher(config.coverageConfig.include);
    const exclude = getMatcher(config.coverageConfig.exclude);
    await recursivelyAddEmptyReports(config, testFiles, include, exclude, istanbulCoverage);
  }
  return istanbulCoverage;
}

export { V8Coverage };
