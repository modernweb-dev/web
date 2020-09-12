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
    name: 'concurrency',
    type: Number,
    description: 'Amount of tests to run concurrently. Defaults to 10.',
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
