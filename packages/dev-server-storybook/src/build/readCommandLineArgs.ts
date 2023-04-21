import commandLineArgs from 'command-line-args';

export function readCommandLineArgs() {
  return commandLineArgs([
    {
      name: 'config-dir',
      alias: 'c',
      type: String,
      defaultValue: './.storybook',
    },
    {
      name: 'output-dir',
      alias: 'o',
      type: String,
      defaultValue: 'storybook-static',
    },
  ]);
}
