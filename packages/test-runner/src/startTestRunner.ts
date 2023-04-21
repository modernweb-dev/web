/* eslint-disable no-inner-declarations */
import { TestRunner, TestRunnerCli } from '@web/test-runner-core';
import { red } from 'nanocolors';

import { TestRunnerConfig } from './config/TestRunnerConfig';
import { mergeConfigs } from './config/mergeConfigs';
import { parseConfig } from './config/parseConfig';
import { readCliArgs } from './config/readCliArgs';
import { readFileConfig } from './config/readFileConfig';
import { TestRunnerStartError } from './TestRunnerStartError';

export interface StartTestRunnerParams {
  /**
   * Optional config to merge with the user-defined config.
   */
  config?: Partial<TestRunnerConfig>;
  /**
   * Whether to read CLI args. Default true.
   */
  readCliArgs?: boolean;
  /**
   * Whether to read a user config from the file system. Default true.
   */
  readFileConfig?: boolean;
  /**
   * Name of the configuration to read. Defaults to web-dev-server.config.{mjs,cjs,js}
   */
  configName?: string;
  /**
   * Whether to automatically exit the process when the server is stopped, killed or an error is thrown.
   */
  autoExitProcess?: boolean;
  /**
   * Array to read the CLI args from. Defaults to process.argv.
   */
  argv?: string[];
}

/**
 * Starts the test runner.
 */
export async function startTestRunner(options: StartTestRunnerParams = {}) {
  const {
    config: extraConfig,
    readCliArgs: readCliArgsFlag = true,
    readFileConfig: readFileConfigFlag = true,
    configName,
    autoExitProcess = true,
    argv = process.argv,
  } = options;

  try {
    const cliArgs = readCliArgsFlag ? readCliArgs({ argv }) : {};
    const rawConfig = readFileConfigFlag
      ? await readFileConfig({ configName, configPath: cliArgs.config })
      : {};
    const mergedConfig = mergeConfigs(extraConfig, rawConfig);
    const { config, groupConfigs } = await parseConfig(mergedConfig, cliArgs);

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
  } catch (error) {
    if (error instanceof TestRunnerStartError) {
      console.error(`\n${red('Error:')} ${error.message}\n`);
    } else {
      console.error(error);
    }

    setTimeout(() => {
      // exit after a timeout to allow CLI to flush console output
      process.exit(1);
    }, 0);
  }
}
