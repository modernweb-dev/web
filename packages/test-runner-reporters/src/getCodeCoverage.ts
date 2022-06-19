import { CoverageThresholdConfig, TestCoverage, CoverageConfig } from '@web/test-runner-core';
import path from 'path';
import { bold, green, red, underline } from 'nanocolors';

const coverageTypes: (keyof CoverageThresholdConfig)[] = [
  'lines',
  'statements',
  'branches',
  'functions',
];

export function getCodeCoverage(
  testCoverage: TestCoverage,
  watch: boolean,
  coverageConfig: CoverageConfig,
) {
  const entries: string[] = [];

  const coverageSum = coverageTypes.reduce((all, type) => all + testCoverage.summary[type].pct, 0);
  const avgCoverage = Math.round((coverageSum * 100) / 4) / 100;

  if (!Number.isNaN(avgCoverage)) {
    const percent = `${avgCoverage} %`;
    entries.push(`Code coverage: ${bold(testCoverage.passed ? green(percent) : red(percent))}`);
  }

  if (!testCoverage.passed && coverageConfig.threshold) {
    coverageTypes.forEach(type => {
      if (testCoverage.summary[type].pct < coverageConfig.threshold![type]) {
        entries.push(
          `Coverage for ${bold(type)} failed with ${bold(
            red(`${testCoverage.summary[type].pct} %`),
          )} compared to configured ${bold(`${coverageConfig.threshold![type]} %`)}`,
        );
      }
    });
  }

  if (!watch && coverageConfig.report && coverageConfig.reporters?.includes('lcov')) {
    entries.push(
      `View full coverage report at ${underline(
        path.join(coverageConfig.reportDir ?? '', 'lcov-report', 'index.html'),
      )}`,
    );
  }

  entries.push('');

  return entries;
}
