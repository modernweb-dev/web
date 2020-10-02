import commandLineArgs from 'command-line-args';
import commandLineUsage, { OptionDefinition } from 'command-line-usage';
import camelCase from 'camelcase';

const defaultOptions: OptionDefinition[] = [
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
    name: 'help',
    type: Boolean,
    description: 'Print help commands',
  },
];

export function readCliArgsConfig<T>(
  extraOptions: OptionDefinition[] = [],
  argv = process.argv,
): Partial<T> {
  const options = [...defaultOptions, ...extraOptions];
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

  const cliArgsConfig: Partial<T> = {};

  for (const [key, value] of Object.entries(cliArgs)) {
    cliArgsConfig[camelCase(key) as keyof T] = value;
  }

  return cliArgsConfig;
}
