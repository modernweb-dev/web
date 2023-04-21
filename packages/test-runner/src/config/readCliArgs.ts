import commandLineArgs from 'command-line-args';
import commandLineUsage, { OptionDefinition } from 'command-line-usage';
import camelCase from 'camelcase';

import { TestRunnerConfig } from './TestRunnerConfig';

export interface TestRunnerCliArgs
  extends Partial<
    Pick<
      TestRunnerConfig,
      | 'files'
      | 'rootDir'
      | 'watch'
      | 'coverage'
      | 'concurrentBrowsers'
      | 'concurrency'
      | 'staticLogging'
      | 'manual'
      | 'open'
      | 'port'
      | 'preserveSymlinks'
      | 'nodeResolve'
      | 'debug'
      | 'esbuildTarget'
    >
  > {
  config?: string;
  groups?: string;
  group?: string;
  puppeteer?: boolean;
  playwright?: boolean;
  browsers?: string[];
  updateSnapshots?: boolean;
}

const options: OptionDefinition[] = [
  {
    name: 'files',
    type: String,
    multiple: true,
    defaultOption: true,
    description: 'Test files to run',
  },
  {
    name: 'root-dir',
    type: String,
    description: 'Root directory to serve files from.',
  },
  {
    name: 'watch',
    type: Boolean,
    description: 'Reload tests on file changes',
  },
  {
    name: 'coverage',
    type: Boolean,
    description: 'Check for code coverage. Slows down testing.',
  },
  {
    name: 'concurrent-browsers',
    type: Number,
    description: 'Amount of browsers to run concurrently. Defaults to 2.',
  },
  {
    name: 'concurrency',
    type: Number,
    description:
      'Amount of test files to run concurrently. Defaults to total CPU cores divided by 2.',
  },
  {
    name: 'config',
    type: String,
    description: 'Location to read config file from.',
  },
  {
    name: 'static-logging',
    type: Boolean,
    description: 'Disables rendering a progress bar dynamically to the terminal.',
  },
  {
    name: 'manual',
    type: Boolean,
    description:
      'Starts test runner in manual testing mode. Ignores browsers option and prints manual testing URL.',
  },
  {
    name: 'open',
    type: Boolean,
    description: 'Opens browser for manual testing. Requires the manual option to be set.',
  },
  {
    name: 'port',
    type: Number,
    description: 'Port to bind the server on.',
  },
  {
    name: 'groups',
    type: String,
    description: 'Pattern of group config files.',
  },
  {
    name: 'group',
    type: String,
    description:
      'Name of the group to run tests for. When this is set, the other groups are ignored.',
  },
  {
    name: 'preserve-symlinks',
    type: Boolean,
    description: "Don't follow symlinks when resolving imports",
  },
  {
    name: 'puppeteer',
    type: Boolean,
    description: 'Run tests using puppeteer',
  },
  {
    name: 'playwright',
    type: Boolean,
    description: 'Run tests using playwright',
  },
  {
    name: 'browsers',
    type: String,
    multiple: true,
    description: 'Browsers to run when choosing puppeteer or playwright',
  },
  {
    name: 'node-resolve',
    type: Boolean,
    description: 'Resolve bare module imports using node resolution',
  },
  {
    name: 'update-snapshots',
    type: Boolean,
    description: 'Whether to accept changes in shapshots, and save them on disk',
  },
  {
    name: 'esbuild-target',
    type: String,
    multiple: true,
    description:
      'JS language target to compile down to using esbuild. Recommended value is "auto", which compiles based on user agent. Check the docs for more options.',
  },
  {
    name: 'debug',
    type: Boolean,
    description: 'Log debug messages',
  },
  {
    name: 'help',
    type: Boolean,
    description: 'Print help commands',
  },
];

export interface ReadCliArgsParams {
  argv?: string[];
}

export function readCliArgs({ argv = process.argv }: ReadCliArgsParams = {}): TestRunnerCliArgs {
  const cliArgs = commandLineArgs(options, { argv, partial: true });

  if ('help' in cliArgs) {
    /* eslint-disable-next-line no-console */
    console.log(
      commandLineUsage([
        {
          header: 'Web Test Runner',
          content: 'Test runner for web applications.',
        },
        {
          header: 'Usage',
          content: 'web-test-runner [options...]' + '\nwtr [options...]',
        },
        { header: 'Options', optionList: options },
      ]),
    );
    process.exit();
  }

  const cliArgsConfig: TestRunnerCliArgs = {};

  for (const [key, value] of Object.entries(cliArgs)) {
    cliArgsConfig[camelCase(key) as keyof TestRunnerCliArgs] = value;
  }

  return cliArgsConfig;
}
