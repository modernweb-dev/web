import { createCoverageMap, CoverageSummaryData } from 'istanbul-lib-coverage';
import { TestSession } from '../test-session/TestSession';
import { CoverageThresholdConfig } from '../runner/TestRunnerConfig';

export const coverageTypes: (keyof CoverageSummaryData)[] = [
  'lines',
  'statements',
  'branches',
  'functions',
];

export interface TestCoverage {
  passed: boolean;
  summary: CoverageSummaryData;
}

export function getTestCoverage(
  sessions: Iterable<TestSession>,
  coverageThreshold?: CoverageThresholdConfig,
): TestCoverage {
  const coverageMap = createCoverageMap();

  for (const session of sessions) {
    if (session.result!.testCoverage) {
      coverageMap.merge(session.result!.testCoverage);
    }
  }

  const summary = coverageMap.getCoverageSummary().data;

  if (coverageThreshold) {
    for (const type of coverageTypes) {
      const { pct } = summary[type];
      if (pct < coverageThreshold[type]) {
        return { summary, passed: false };
      }
    }
  }
  return { summary, passed: true };
}
