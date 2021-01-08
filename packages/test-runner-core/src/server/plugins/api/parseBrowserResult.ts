import { MapStackLocation, StackLocation } from '@web/browser-logs';

import { TestRunnerCoreConfig } from '../../../config/TestRunnerCoreConfig';
import { TestSession } from '../../../test-session/TestSession';
import { SourceMapFunction } from './createSourceMapFunction';
import { parseSessionErrors, parseTestResults } from './parseBrowserErrors';
import { parseBrowserLogs } from './parseBrowserLogs';

function createMapStackLocation(smFn: SourceMapFunction, userAgent: string): MapStackLocation {
  return async function mapStackLocation(originalLoc: StackLocation) {
    const mappedLoc = await smFn(originalLoc, userAgent);
    const returnV = mappedLoc ? mappedLoc : originalLoc;
    return returnV;
  };
}

export async function parseBrowserResult(
  config: TestRunnerCoreConfig,
  sourceMapFunction: SourceMapFunction,
  userAgent: string,
  result: Partial<TestSession>,
) {
  const mapStackLocation = createMapStackLocation(sourceMapFunction, userAgent);
  await Promise.all([
    parseBrowserLogs(config, mapStackLocation, result),
    parseSessionErrors(config, mapStackLocation, result),
    parseTestResults(config, mapStackLocation, result),
  ]);
  return result;
}
