import {
  createCoverageMap,
  CoverageSummaryData,
  CoverageMap,
  CoverageMapData,
  BranchMapping,
  Location,
  Range,
} from 'istanbul-lib-coverage';
import { TestSession } from '../test-session/TestSession';
import { CoverageConfig } from '../config/TestRunnerCoreConfig';

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

const locEquals = (a: Location, b: Location) => a.column === b.column && a.line === b.line;
const rangeEquals = (a: Range, b: Range) => locEquals(a.start, b.start) && locEquals(a.end, b.end);

function findBranchKey(branches: Record<string, BranchMapping>, branch: BranchMapping) {
  for (const [key, m] of Object.entries(branches)) {
    if (rangeEquals(m.loc, branch.loc)) {
      return key;
    }
  }
}

/**
 * Cross references coverage mapping data, looking for missing code branches
 * and adding empty entries for them if found. This is necessary because istanbul
 * expects code branch data to be equal for all coverage entries, while v8 only
 * outputs actual covered code branches.
 *
 * See https://github.com/istanbuljs/istanbuljs/issues/531 for more.
 * @param coverages
 */
function addingMissingCoverageBranches(coverages: CoverageMapData[]) {
  const branchesPerFile = new Map<string, Record<string, BranchMapping>>();

  // collect code branches from all code coverage entries
  for (const coverage of coverages) {
    for (const [filePath, fileCoverage] of Object.entries(coverage)) {
      let branches = branchesPerFile.get(filePath);
      if (!branches) {
        branches = {};
        branchesPerFile.set(filePath, branches);
      }

      for (const branch of Object.values(fileCoverage.branchMap)) {
        if (findBranchKey(branches, branch) == null) {
          const key = Object.keys(branches).length;
          branches[key] = branch;
        }
      }
    }
  }

  // patch coverage entries to add missing code branches
  for (const coverage of coverages) {
    for (const [filePath, fileCoverage] of Object.entries(coverage)) {
      const branches = branchesPerFile.get(filePath)!;
      const originalBranches = fileCoverage.branchMap;
      const originalB = fileCoverage.b;
      fileCoverage.branchMap = branches;
      fileCoverage.b = {};

      for (const [key, mapping] of Object.entries(branches)) {
        const originalKey = findBranchKey(originalBranches, mapping);
        if (originalKey != null) {
          fileCoverage.b[key] = originalB[originalKey];
        } else {
          fileCoverage.b[key] = [0];
        }
      }
    }
  }
}

export function getTestCoverage(
  sessions: Iterable<TestSession>,
  config?: CoverageConfig,
): TestCoverage {
  const coverageMap = createCoverageMap();
  let coverages = Array.from(sessions)
    .map(s => s.testCoverage)
    .filter(c => c) as CoverageMapData[];
  // istanbul mutates the coverage objects, which pollutes coverage in watch mode
  // cloning prevents this. JSON stringify -> parse is faster than a fancy library
  // because we're only working with objects and arrays
  coverages = JSON.parse(JSON.stringify(coverages));

  addingMissingCoverageBranches(coverages);

  for (const coverage of coverages) {
    coverageMap.merge(coverage);
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
