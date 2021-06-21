import {
  createCoverageMap,
  CoverageSummaryData,
  CoverageMap,
  CoverageMapData,
  BranchMapping,
  FunctionMapping,
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
const locBefore = (a: Location, b: Location) =>
  a.line < b.line || (a.line === b.line && a.column <= b.column);
const rangeEquals = (a: Range, b: Range) => locEquals(a.start, b.start) && locEquals(a.end, b.end);
const rangeEncompass = (a: Range, b: Range) =>
  locBefore(a.start, b.start) && locBefore(b.end, a.end);

function getRangeDistance(encompassing: Range, range: Range) {
  const startDistanceLine = range.start.line - encompassing.start.line;
  const startDistanceColumn = startDistanceLine
    ? range.start.column - encompassing.start.column
    : 0;

  const endDistanceLine = encompassing.end.line - range.end.line;
  const endDistanceColumn = endDistanceLine ? encompassing.end.column - range.end.column : 0;

  // Multiply each line by 100_000, as lines length are unknown but should never reach this size
  return (
    startDistanceLine * 100_000 +
    endDistanceLine * 100_000 +
    startDistanceColumn +
    endDistanceColumn
  );
}

function findKey<T extends BranchMapping | FunctionMapping>(items: Record<string, T>, item: T) {
  for (const [key, m] of Object.entries(items)) {
    if (rangeEquals(m.loc, item.loc)) {
      return key;
    }
  }
}

function findEncompassingKey<T extends BranchMapping | FunctionMapping>(
  items: Record<string, T>,
  item: T,
) {
  // Get all encompassing branches
  const encompassingEntries = Object.entries(items).filter(([, m]) =>
    rangeEncompass(m.loc, item.loc),
  );

  if (encompassingEntries.length) {
    // Sort the encompassing branches by distance to the searched branch
    encompassingEntries.sort(
      (a, b) => getRangeDistance(a[1].loc, item.loc) - getRangeDistance(b[1].loc, item.loc),
    );

    // Return the key of the narrowest encompassing branch
    return encompassingEntries[0][0];
  }
}

function collectCoverageItems<T extends BranchMapping | FunctionMapping>(
  filePath: string,
  itemsPerFile: Map<string, Record<string, T>>,
  itemMap: Record<string, T>,
) {
  let items = itemsPerFile.get(filePath);
  if (!items) {
    items = {};
    itemsPerFile.set(filePath, items);
  }

  for (const item of Object.values(itemMap)) {
    if (findKey(items, item) == null) {
      const key = Object.keys(items).length;
      items[key] = item;
    }
  }
}

function patchCoverageItems<T extends BranchMapping | FunctionMapping, U extends number | number[]>(
  filePath: string,
  itemsPerFile: Map<string, Record<string, T>>,
  itemMap: Record<string, T>,
  itemIndex: Record<string, U>,
  findOriginalKey: (items: Record<string, T>, item: T) => string | undefined,
  defaultIndex: () => U,
) {
  const items = itemsPerFile.get(filePath)!;
  const originalItems = itemMap;
  const originalIndex = itemIndex;
  itemMap = items;
  itemIndex = {};

  for (const [key, mapping] of Object.entries(items)) {
    const originalKey = findOriginalKey(originalItems, mapping);
    if (originalKey != null) {
      itemIndex[key] = originalIndex[originalKey];
    } else {
      itemIndex[key] = defaultIndex();
    }
  }

  return { itemMap, itemIndex };
}

/**
 * Cross references coverage mapping data, looking for missing code branches and
 * functions and adding empty entries for them if found. This is necessary
 * because istanbul expects code branch and function data to be equal for all
 * coverage entries. V8 only outputs actual covered code branches and functions
 * that are defined at runtime (for example methods defined in a constructor
 * that isn't run will not be included).
 *
 * See https://github.com/istanbuljs/istanbuljs/issues/531,
 * https://github.com/istanbuljs/v8-to-istanbul/issues/121 and
 * https://github.com/modernweb-dev/web/issues/689 for more.
 * @param coverages
 */
function addingMissingCoverageItems(coverages: CoverageMapData[]) {
  const branchesPerFile = new Map<string, Record<string, BranchMapping>>();
  const functionsPerFile = new Map<string, Record<string, FunctionMapping>>();

  // collect functions and code branches from all code coverage entries
  for (const coverage of coverages) {
    for (const [filePath, fileCoverage] of Object.entries(coverage)) {
      collectCoverageItems(filePath, branchesPerFile, fileCoverage.branchMap);
      collectCoverageItems(filePath, functionsPerFile, fileCoverage.fnMap);
    }
  }

  // patch coverage entries to add missing code branches
  for (const coverage of coverages) {
    for (const [filePath, fileCoverage] of Object.entries(coverage)) {
      const patchedBranches = patchCoverageItems(
        filePath,
        branchesPerFile,
        fileCoverage.branchMap,
        fileCoverage.b,
        findEncompassingKey,
        () => [0],
      );
      fileCoverage.branchMap = patchedBranches.itemMap;
      fileCoverage.b = patchedBranches.itemIndex;

      const patchedFunctions = patchCoverageItems(
        filePath,
        functionsPerFile,
        fileCoverage.fnMap,
        fileCoverage.f,
        findKey,
        () => 0,
      );
      fileCoverage.fnMap = patchedFunctions.itemMap;
      fileCoverage.f = patchedFunctions.itemIndex;
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

  addingMissingCoverageItems(coverages);

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
