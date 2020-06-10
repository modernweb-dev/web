import reports from 'istanbul-reports';
import libReport from 'istanbul-lib-report';
import { TestCoverage, CoverageConfig } from '@web/test-runner-core';

export function writeCoverageReport(testCoverage: TestCoverage, config: CoverageConfig) {
  // create a context for report generation
  const context = libReport.createContext({
    dir: config.reportDir,
    watermarks: {
      statements: [50, 80],
      functions: [50, 80],
      branches: [50, 80],
      lines: [50, 80],
    },
    coverageMap: testCoverage.coverageMap,
  });

  const report = reports.create('lcov');
  (report as any).execute(context);
}
