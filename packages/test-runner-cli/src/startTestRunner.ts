/* eslint-disable no-async-promise-executor */
import { TestRunner, TestRunnerCoreConfig, TestRunnerGroupConfig } from '@web/test-runner-core';
import { TestRunnerCli } from './cli/TestRunnerCli';

export interface StartTestRunnerOptions {
  autoExitProcess?: boolean;
}

export async function startTestRunner(
  config: TestRunnerCoreConfig,
  groupConfigs: TestRunnerGroupConfig[] = [],
  options: StartTestRunnerOptions = {},
) {
  const { autoExitProcess = true } = options;
  const runner = new TestRunner(config, groupConfigs);
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
