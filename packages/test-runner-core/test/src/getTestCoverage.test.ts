import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CoverageMapData } from 'istanbul-lib-coverage';

import { getTestCoverage } from '../../dist/coverage/getTestCoverage.js';
import type { TestSession } from '../../dist/test-session/TestSession.js';

function createFileCoverage(path: string, covered: boolean[]) {
  const statementMap: CoverageMapData[string]['statementMap'] = {};
  const s: Record<string, number> = {};
  covered.forEach((isCovered, i) => {
    statementMap[i] = { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 10 } };
    s[i] = isCovered ? 1 : 0;
  });
  return { path, statementMap, s, fnMap: {}, f: {}, branchMap: {}, b: {} };
}

function createSessions(): TestSession[] {
  const testCoverage: CoverageMapData = {
    '/a.js': createFileCoverage('/a.js', [true, true, true, true]),
    '/b.js': createFileCoverage('/b.js', [true, false]),
  };
  return [{ testCoverage } as unknown as TestSession];
}

const threshold = { statements: 60, branches: 0, functions: 0, lines: 60 };

describe('getTestCoverage', () => {
  it('passes when no threshold is configured', () => {
    const result = getTestCoverage(createSessions());
    assert.equal(result.passed, true);
    assert.equal(result.failedFiles, undefined);
  });

  it('checks the threshold against the aggregate by default', () => {
    // 5 of 6 statements are covered, which is above the threshold
    const result = getTestCoverage(createSessions(), { threshold });
    assert.equal(result.passed, true);
    assert.equal(result.failedFiles, undefined);
  });

  it('fails when the aggregate is below the threshold', () => {
    const result = getTestCoverage(createSessions(), {
      threshold: { ...threshold, statements: 90 },
    });
    assert.equal(result.passed, false);
  });

  it('checks the threshold for each file when perFile is enabled', () => {
    const result = getTestCoverage(createSessions(), {
      threshold: { ...threshold, perFile: true },
    });
    assert.equal(result.passed, false);
    assert.deepEqual(
      result.failedFiles?.map(f => f.file),
      ['/b.js'],
    );
    assert.equal(result.failedFiles?.[0].summary.statements.pct, 50);
  });

  it('passes with perFile when every file meets the threshold', () => {
    const result = getTestCoverage(createSessions(), {
      threshold: { ...threshold, statements: 50, lines: 50, perFile: true },
    });
    assert.equal(result.passed, true);
    assert.deepEqual(result.failedFiles, []);
  });
});
