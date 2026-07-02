import { promises as fs } from 'fs';
import globby from 'globby';
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import path from 'path';

import { chromeLauncher } from '@web/test-runner-chrome';
import type { TestRunnerCoreConfig } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { junitReporter } from '../dist/junitReporter.js';

const NON_ZERO_TIME_VALUE_REGEX = /time="((\d\.\d+)|(\d))"/g;

const USER_AGENT_STRING_REGEX = /"Mozilla\/5\.0 (.*)"/g;

const rootDir = path.resolve(import.meta.dirname, '..', '..', '..');

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
    cwd: import.meta.dirname,
  }))
    await fs.unlink(file);
}

describe('junitReporter', () => {
  after(cleanupFixtures);

  describe('for a simple case', () => {
    const fixtureDir = path.join(import.meta.dirname, 'fixtures/simple');
    it('produces expected results', async () => {
      const { actual, expected } = await run(fixtureDir);
      assert.equal(actual, expected);
    });
  });

  describe('for a nested suite', () => {
    const fixtureDir = path.join(import.meta.dirname, 'fixtures/nested');
    it('produces expected results', async () => {
      const { actual, expected } = await run(fixtureDir);
      assert.equal(actual, expected);
    });
  });

  describe('for multiple test files', () => {
    const fixtureDir = path.join(import.meta.dirname, 'fixtures/multiple');
    it('produces expected results', async () => {
      const { actual, expected } = await run(fixtureDir);
      assert.equal(actual, expected);
    });
  });
});
