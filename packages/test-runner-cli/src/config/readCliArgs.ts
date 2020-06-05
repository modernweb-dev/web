import { TestRunnerConfig } from '@web/test-runner-core';
import commandLineArgs from 'command-line-args';
import camelCase from 'camelcase';

const defaultCommandLineArgs: commandLineArgs.OptionDefinition[] = [
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

export function readCliArgs(
  extraOptions: commandLineArgs.OptionDefinition[] = [],
  argv = process.argv,
): Partial<TestRunnerConfig> {
  const args = commandLineArgs([...defaultCommandLineArgs, ...extraOptions], { argv });
  const config: Partial<TestRunnerConfig> = {};

  for (const [key, value] of Object.entries(args)) {
    config[camelCase(key) as keyof TestRunnerConfig] = value;
  }

  return config;
}
