import { TestRunnerConfig } from '@web/test-runner-core';
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
];

interface ReturnValue {
  cliArgs: Record<string, any>;
  cliArgsConfig: Partial<TestRunnerConfig>;
}

export function readCliArgs(
  extraOptions: OptionDefinition[] = [],
  argv = process.argv,
): ReturnValue {
  const cliArgs = commandLineArgs([...defaultOptions, ...extraOptions], { argv });
  const cliArgsConfig: Partial<TestRunnerConfig> = {};

  for (const [key, value] of Object.entries(cliArgs)) {
    // the default options can be converted to camelcase directly
    if (defaultOptions.find(e => e.name === key)) {
      cliArgsConfig[camelCase(key) as keyof TestRunnerConfig] = value;
    }
  }

  return { cliArgs, cliArgsConfig };
}
