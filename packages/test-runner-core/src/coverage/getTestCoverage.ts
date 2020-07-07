import { createCoverageMap, CoverageSummaryData, CoverageMap } from 'istanbul-lib-coverage';
import { TestSession } from '../test-session/TestSession';
import { CoverageThresholdConfig } from '../runner/TestRunnerCoreConfig';

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
  coverageThreshold?: CoverageThresholdConfig,
): TestCoverage {
  const coverageMap = createCoverageMap();

  for (const session of sessions) {
    if (session.testCoverage) {
      coverageMap.merge(session.testCoverage);
    }
  }

  const summary = coverageMap.getCoverageSummary().data;

  if (coverageThreshold) {
    for (const type of coverageTypes) {
      const { pct } = summary[type];
      if (pct < coverageThreshold[type]) {
        return { coverageMap, summary, passed: false };
      }
    }
  }
  return { coverageMap, summary, passed: true };
}
