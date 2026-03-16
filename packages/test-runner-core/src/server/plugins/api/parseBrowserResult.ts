import { type MapStackLocation, type StackLocation, type MapBrowserUrl } from '@web/browser-logs';

import { type TestRunnerCoreConfig } from '../../../config/TestRunnerCoreConfig';
import { type TestSession } from '../../../test-session/TestSession';
import { type SourceMapFunction } from './createSourceMapFunction.ts';
import { parseSessionErrors, parseTestResults } from './parseBrowserErrors.ts';
import { parseBrowserLogs } from './parseBrowserLogs.ts';
function createMapStackLocation(smFn: SourceMapFunction, userAgent: string): MapStackLocation {
  return async function mapStackLocation(originalLoc: StackLocation) {
    const mappedLoc = await smFn(originalLoc, userAgent);
    return mappedLoc ? mappedLoc : originalLoc;
  };
}

export async function parseBrowserResult(
  config: TestRunnerCoreConfig,
  mapBrowserUrl: MapBrowserUrl,
  sourceMapFunction: SourceMapFunction,
  userAgent: string,
  result: Partial<TestSession>,
) {
  const mapStackLocation = createMapStackLocation(sourceMapFunction, userAgent);
  await Promise.all([
    parseBrowserLogs(config, mapBrowserUrl, mapStackLocation, result).catch(error => {
      console.error(error);
    }),
    parseSessionErrors(config, mapBrowserUrl, mapStackLocation, result).catch(error => {
      console.error(error);
    }),
    parseTestResults(config, mapBrowserUrl, mapStackLocation, result).catch(error => {
      console.error(error);
    }),
  ]);
  return result;
}
