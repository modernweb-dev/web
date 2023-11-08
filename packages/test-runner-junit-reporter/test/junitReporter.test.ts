import { expect } from 'chai';
import { promises as fs } from 'fs';
import path from 'path';
import globby from 'globby';

import { chromeLauncher } from '@web/test-runner-chrome';
import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { junitReporter } from '../src/junitReporter.js';

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

describe('junitReporter', function () {
  after(cleanupFixtures);

  describe('for a simple case', function () {
    const fixtureDir = path.join(__dirname, 'fixtures/simple');
    it('produces expected results', async function () {
      const { actual, expected } = await run(fixtureDir);
      expect(actual).to.equal(expected);
    });
  });

  describe('for a nested suite', function () {
    const fixtureDir = path.join(__dirname, 'fixtures/nested');
    it('produces expected results', async function () {
      const { actual, expected } = await run(fixtureDir);
      expect(actual).to.equal(expected);
    });
  });

  describe('for multiple test files', function () {
    const fixtureDir = path.join(__dirname, 'fixtures/multiple');
    it('produces expected results', async function () {
      const { actual, expected } = await run(fixtureDir);
      expect(actual).to.equal(expected);
    });
  });
});
