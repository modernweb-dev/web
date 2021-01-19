import reports from 'istanbul-reports';
import libReport from 'istanbul-lib-report';

import { CoverageConfig } from '../config/TestRunnerCoreConfig';
import { TestCoverage } from '../coverage/getTestCoverage';

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

  const reporters = config.reporters || [];

  for (const reporter of reporters) {
    const report = reports.create(reporter, {
      projectRoot: process.cwd(),
      maxCols: process.stdout.columns || 100,
    });
    (report as any).execute(context);
  }
}
