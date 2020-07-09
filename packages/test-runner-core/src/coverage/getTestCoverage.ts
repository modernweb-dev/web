import {
  createCoverageMap,
  CoverageSummaryData,
  CoverageMap,
  CoverageMapData,
} from 'istanbul-lib-coverage';
import path from 'path';
import { TestSession } from '../test-session/TestSession';
import { CoverageConfig } from '../runner/TestRunnerCoreConfig';

export const coverageTypes: (keyof CoverageSummaryData)[] = [
  'lines',
  'statements',
  'branches',
  'functions',
];

export interface TestCoverage {
  passed: boolean;
  coverageMap: CoverageMap;
  summary: CoverageSummaryData;
}

export function getTestCoverage(
  sessions: Iterable<TestSession>,
  config?: CoverageConfig,
): TestCoverage {
  const coverageMap = createCoverageMap();

  for (const session of sessions) {
    if (session.testCoverage) {
      coverageMap.merge(session.testCoverage);
    }
  }

  const summary = coverageMap.getCoverageSummary().data;

  if (config?.threshold) {
    for (const type of coverageTypes) {
      const { pct } = summary[type];
      if (pct < config.threshold[type]) {
        return { coverageMap, summary, passed: false };
      }
    }
  }
  return { coverageMap, summary, passed: true };
}
