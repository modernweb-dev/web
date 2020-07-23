/* eslint-disable no-async-promise-executor */
import { TestRunner, TestRunnerCoreConfig } from '@web/test-runner-core';
import { TestRunnerCli } from './cli/TestRunnerCli';
import { collectTestFiles } from './config/collectTestFiles';

export interface StartTestRunnerOptions {
  autoExitProcess?: boolean;
}

export async function startTestRunner(
  config: TestRunnerCoreConfig,
  options: StartTestRunnerOptions = {},
) {
  const { autoExitProcess = true } = options;
  const testFiles = await collectTestFiles(
    Array.isArray(config.files) ? config.files : [config.files],
  );
  if (testFiles.length === 0) {
    console.error(`Could not find any files with pattern(s): ${config.files}`);
    process.exit(1);
  }

  const runner = new TestRunner(config, testFiles);
  const cli = new TestRunnerCli(config, runner);

  function stop() {
    runner.stop();
  }

  if (autoExitProcess) {
    (['exit', 'SIGINT'] as NodeJS.Signals[]).forEach(event => {
      process.on(event, stop);
    });
  }

  if (autoExitProcess) {
    process.on('uncaughtException', error => {
      /* eslint-disable-next-line no-console */
      console.error(error);
      stop();
    });
  }

  runner.on('stopped', passed => {
    if (autoExitProcess) {
      process.exit(passed ? 0 : 1);
    }
  });

  await runner.start();
  cli.start();
  return runner;
}
