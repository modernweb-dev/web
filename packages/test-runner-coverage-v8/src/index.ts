import { extname, join, isAbsolute, sep, posix } from 'path';
import { CoverageMapData } from 'istanbul-lib-coverage';
import v8toIstanbulLib from 'v8-to-istanbul';
import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { Profiler } from 'inspector';
import picoMatch from 'picomatch';

import { toFilePath } from './utils';

type V8Coverage = Profiler.ScriptCoverage & { source?: string };
type Matcher = (test: string) => boolean;

const cachedMatchers = new Map<string, Matcher>();

// coverage base dir must be separated with "/"
const coverageBaseDir = process.cwd().split(sep).join('/');

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
) {
  const included = getMatcher(config?.coverageConfig?.include);
  const excluded = getMatcher(config?.coverageConfig?.exclude);
  const istanbulCoverage: CoverageMapData = {};

  for (const entry of coverage) {
    const path = new URL(entry.url).pathname;
    if (
      !!extname(path) &&
      !path.startsWith('/__web-test-runner__') &&
      !path.startsWith('/__web-dev-server')
    ) {
      const filePath = join(config.rootDir, toFilePath(path));

      if (!testFiles.includes(filePath) && included(filePath) && !excluded(filePath)) {
        const converter = v8toIstanbulLib(
          filePath,
          0,
          entry.source ? { source: entry.source } : undefined,
        );
        await converter.load();
        converter.applyCoverage(entry.functions);
        Object.assign(istanbulCoverage, converter.toIstanbul());
      }
    }
  }

  return istanbulCoverage;
}

export { V8Coverage };
