import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import globby from 'globby';

import { chromeLauncher } from '@web/test-runner-chrome';
import { TestRunner, TestRunnerCoreConfig } from '@web/test-runner-core';
import { TestRunnerCli } from '@web/test-runner-cli';
import { junitReporter } from '../src/index';

import { getPortPromise } from 'portfinder';

const STACK_TRACE_UNIQUE_IDS_REGEX = /localhost:\d+|wtr-session-id=[\w\d]+-[\w\d]+-[\w\d]+-[\w\d]+-[\w\d]+|\.js:\d+:\d+/g;

const NON_ZERO_TIME_VALUE_REGEX = /time="((\d\.\d+)|(\d))"/g;

const USER_AGENT_STRING_REGEX = /"Mozilla\/5\.0 (.*)"/g;

const MONOREPO_PATH_REGEX = /\/packages\/test-runner-junit-reporter/g;

const normalizeOutput = (cwd: string, output: string) =>
  output
    .replace(STACK_TRACE_UNIQUE_IDS_REGEX, '<<unique>>')
    .replace(NON_ZERO_TIME_VALUE_REGEX, 'time="<<computed>>"')
    .replace(USER_AGENT_STRING_REGEX, '"<<useragent>>"')
    .replace(MONOREPO_PATH_REGEX, '')
    .replace(new RegExp(cwd, 'g'), '<<cwd>>');

function createConfig(): Omit<TestRunnerCoreConfig, 'rootDir' | 'port' | 'files' | 'reporters'> {
  return {
    testFramework: { path: require.resolve('@web/test-runner-mocha/dist/autorun.js') },
    protocol: 'http:',
    hostname: 'localhost',
    concurrentBrowsers: 2,
    concurrency: 6,
    browserStartTimeout: 30000,
    testsStartTimeout: 10000,
    testsFinishTimeout: 20000,
    browserLogs: true,
    watch: false,
    logger: {
      ...console,
      debug() {
        //
      },
      logSyntaxError(error) {
        console.error(error);
      },
    },
    browsers: [chromeLauncher()],
  };
}

const rootDir = path.join(__dirname, '..', '..', '..');

async function launchTestRunner(cwd: string): Promise<{ actual: string; expected: string }> {
  const files = await globby('*.test.js', { absolute: true, cwd });
  const port = await getPortPromise({ port: 9000 + Math.floor(Math.random() * 1000) });
  const outputPath = path.join(cwd, './test-results.xml');
  const reporters = [junitReporter({ outputPath })];
  const config: TestRunnerCoreConfig = { ...createConfig(), rootDir, port, files, reporters };

  const runner = new TestRunner(config);
  const cli = new TestRunnerCli(config, runner);

  await runner.start();

  cli.start();

  return new Promise(resolve => {
    runner.on('stopped', async () => {
      const actual = normalizeOutput(rootDir, fs.readFileSync(outputPath, 'utf-8'));
      const expected = normalizeOutput(
        rootDir,
        fs.readFileSync(path.join(cwd, './expected.xml'), 'utf-8'),
      );
      resolve({ actual, expected });
    });
  });
}

describe.skip('junitReporter', function () {
  this.timeout(10000);

  async function cleanUpFixtures() {
    for (const file of await globby('fixtures/**/test-results.xml', {
      absolute: true,
      cwd: __dirname,
    }))
      fs.unlinkSync(file);
  }

  after(cleanUpFixtures);

  describe('for a simple case', function () {
    const fixtureDir = path.join(__dirname, 'fixtures/simple');
    it('produces expected results', async function () {
      const { actual, expected } = await launchTestRunner(fixtureDir);
      expect(actual).to.equal(expected);
    });
  });

  describe('for a nested suite', function () {
    const fixtureDir = path.join(__dirname, 'fixtures/nested');
    it('produces expected results', async function () {
      const { actual, expected } = await launchTestRunner(fixtureDir);
      expect(actual).to.equal(expected);
    });
  });

  describe('for multiple test files', function () {
    const fixtureDir = path.join(__dirname, 'fixtures/multiple');
    it('produces expected results', async function () {
      const { actual, expected } = await launchTestRunner(fixtureDir);
      expect(actual).to.equal(expected);
    });
  });
});
