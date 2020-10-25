import { CoverageThresholdConfig, TestCoverage, CoverageConfig } from '@web/test-runner-core';
import path from 'path';
import chalk from 'chalk';

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
    entries.push(
      `Code coverage: ${chalk.bold(
        chalk[testCoverage.passed ? 'green' : 'red'](`${avgCoverage} %`),
      )}`,
    );
  }

  if (!testCoverage.passed && coverageConfig.threshold) {
    coverageTypes.forEach(type => {
      if (testCoverage.summary[type].pct < coverageConfig.threshold![type]) {
        entries.push(
          `Coverage for ${chalk.bold(type)} failed with ${chalk.bold(
            chalk.red(`${testCoverage.summary[type].pct} %`),
          )} compared to configured ${chalk.bold(`${coverageConfig.threshold![type]} %`)}`,
        );
      }
    });
  }

  if (!watch && coverageConfig.report) {
    entries.push(
      `View full coverage report at ${chalk.underline(
        path.join(coverageConfig.reportDir, 'lcov-report', 'index.html'),
      )}`,
    );
  }

  entries.push('');

  return entries;
}
