import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'fs';
import path from 'path';
import globby from 'globby';

<<<<<<< HEAD
import { chromeLauncher } from '@web/test-runner-chrome.js';
import type { TestRunnerCoreConfig } from '@web/test-runner-core.js';
import { runTests } from '@web/test-runner-core/test-helpers.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { chromeLauncher } from '@web/test-runner-chrome.ts';
import type { TestRunnerCoreConfig } from '@web/test-runner-core.ts';
import { runTests } from '@web/test-runner-core/test-helpers.ts';
=======
import { chromeLauncher } from '@web/test-runner-chrome';
import type { TestRunnerCoreConfig } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
<<<<<<< HEAD
import { junitReporter } from '../src/junitReporter.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { junitReporter } from '../src/junitReporter.ts';
=======
<<<<<<< HEAD
import { junitReporter } from '../src/junitReporter.ts';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { junitReporter } from '../src/junitReporter.js';
=======
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { junitReporter } from '../src/junitReporter.ts';

const __dirname = import.meta.dirname;
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)

const NON_ZERO_TIME_VALUE_REGEX = /time="((\d\.\d+)|(\d))"/g;

const USER_AGENT_STRING_REGEX = /"Mozilla\/5\.0 (.*)"/g;

const rootDir = path.join(__dirname, '..', '..', '..');

const normalizeOutput = (cwd: string, output: string) =>
  output
    .replace(NON_ZERO_TIME_VALUE_REGEX, 'time="<<computed>>"')
    .replace(USER_AGENT_STRING_REGEX, '"<<useragent>>"')
    .replace(/(Context|n).<anonymous>/g, '<<anonymous>>')
    // don't judge - normalizing paths for windblows
    .replace(/\/>/g, '🙈>')
    .replace(/<\//g, '<🙈')
    .replace(/\//g, path.sep)
    .replace(/🙈>/g, '/>')
    .replace(/<🙈/g, '</')
    .trimEnd();

const readNormalized = (filePath: string): Promise<string> =>
  fs.readFile(filePath, 'utf-8').then(out => normalizeOutput(rootDir, out));

function createConfig({
  files,
  reporters,
}: Partial<TestRunnerCoreConfig>): Partial<TestRunnerCoreConfig> {
  return {
    files,
    reporters,
    rootDir,
    coverageConfig: {
      report: false,
      reportDir: process.cwd(),
    },
    browserLogs: true,
    watch: false,
    browsers: [chromeLauncher()],
  };
}

async function run(cwd: string): Promise<{ actual: string; expected: string }> {
  const files = await globby('*-test.js', { absolute: true, cwd });
  const outputPath = path.join(cwd, './test-results.xml');
  const reporters = [junitReporter({ outputPath })];
  await runTests(createConfig({ files, reporters }), [], {
    allowFailure: true,
    reportErrors: false,
  });
  const actual = await readNormalized(outputPath);
  const expected = await readNormalized(path.join(cwd, './expected.xml'));
  return { actual, expected };
}

async function cleanupFixtures() {
  for (const file of await globby('fixtures/**/test-results.xml', {
    absolute: true,
    cwd: __dirname,
  }))
    await fs.unlink(file);
}

describe('junitReporter', { timeout: 60000 }, () => {
  after(cleanupFixtures);

  describe('for a simple case', () => {
    const fixtureDir = path.join(__dirname, 'fixtures/simple');
    it('produces expected results', { timeout: 30000 }, async () => {
      const { actual, expected } = await run(fixtureDir);
      assert.equal(actual, expected);
    });
  });

  describe('for a nested suite', () => {
    const fixtureDir = path.join(__dirname, 'fixtures/nested');
    it('produces expected results', { timeout: 30000 }, async () => {
      const { actual, expected } = await run(fixtureDir);
      assert.equal(actual, expected);
    });
  });

  describe('for multiple test files', () => {
    const fixtureDir = path.join(__dirname, 'fixtures/multiple');
    it('produces expected results', { timeout: 30000 }, async () => {
      const { actual, expected } = await run(fixtureDir);
      assert.equal(actual, expected);
    });
  });
});
