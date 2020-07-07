import commandLineArgs, { OptionDefinition } from 'command-line-args';
import camelCase from 'camelcase';

const defaultOptions: OptionDefinition[] = [
  {
    name: 'files',
    type: String,
    multiple: true,
    defaultOption: true,
  },
  {
    name: 'watch',
    type: Boolean,
  },
  {
    name: 'coverage',
    type: Boolean,
  },
  {
    name: 'concurrency',
    type: Boolean,
  },
  {
    name: 'config',
    type: String,
  },
  {
    name: 'static-logging',
    type: Boolean,
  },
  {
    name: 'root-dir',
    type: String,
  },
];

export function readCliArgsConfig<T>(
  extraOptions: OptionDefinition[] = [],
  argv = process.argv,
): Partial<T> {
  const cliArgs = commandLineArgs([...defaultOptions, ...extraOptions], { argv });
  const cliArgsConfig: Partial<T> = {};

  for (const [key, value] of Object.entries(cliArgs)) {
    cliArgsConfig[camelCase(key) as keyof T] = value;
  }

  return cliArgsConfig;
}
