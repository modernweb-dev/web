import { CoverageThresholdConfig, TestCoverage } from '@web/test-runner-core';
import { TerminalEntry } from '../Terminal';
import chalk from 'chalk';

const coverageTypes: (keyof CoverageThresholdConfig)[] = [
  'lines',
  'statements',
  'branches',
  'functions',
];

export function getTestCoverage(
  testCoverage: TestCoverage,
  coverageThreshold?: CoverageThresholdConfig,
) {
  const entries: TerminalEntry[] = [];

  if (testCoverage.passed) {
    const coverageSum = coverageTypes.reduce(
      (all, type) => all + testCoverage.summary[type].pct,
      0,
    );
    const avgCoverage = Math.round((coverageSum * 100) / 4) / 100;

    entries.push(`Test coverage: ${chalk.green(`${avgCoverage} %`)}`);
  } else {
    entries.push('Test coverage: ');
    const totalsStrings = [];

    for (const type of coverageTypes) {
      const { pct } = testCoverage.summary[type];
      const passed = !coverageThreshold || pct >= coverageThreshold[type];
      const name = `${type[0].toUpperCase()}${type.substring(1)}`;
      totalsStrings.push(`${name}: ${chalk[passed ? 'green' : 'red'](`${pct} %`)}`);
    }

    entries.push({ text: totalsStrings.join('\n'), indent: 2 });
  }
  return entries;
}
