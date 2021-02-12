import commandLineArgs from 'command-line-args';
import commandLineUsage, { OptionDefinition } from 'command-line-usage';
import camelCase from 'camelcase';
import { DevServerConfig } from './DevServerConfig';

export interface DevServerCliArgs
  extends Partial<
    Pick<
      DevServerConfig,
      | 'rootDir'
      | 'open'
      | 'appIndex'
      | 'preserveSymlinks'
      | 'nodeResolve'
      | 'watch'
      | 'esbuildTarget'
    >
  > {
  config?: string;
}

const options: (OptionDefinition & { description: string })[] = [
  {
    name: 'config',
    alias: 'c',
    type: String,
    description: 'The file to read configuration from. Config entries are camelCases flags.',
  },
  {
    name: 'root-dir',
    alias: 'r',
    type: String,
    description:
      'The root directory to serve files from. Defaults to the current working directory.',
  },
  {
    name: 'open',
    alias: 'o',
    type: String,
    description: 'Opens the browser on app-index, root dir or a custom path.',
  },
  {
    name: 'app-index',
    alias: 'a',
    type: String,
    description:
      "The app's index.html file. When set, serves the index.html for non-file requests. Use this to enable SPA routing.",
  },
  {
    name: 'preserve-symlinks',
    description: "Don't follow symlinks when resolving module imports.",
    type: Boolean,
  },
  {
    name: 'node-resolve',
    description: 'Resolve bare module imports using node resolution',
    type: Boolean,
  },
  {
    name: 'watch',
    alias: 'w',
    description: 'Reload the browser when files are changed.',
    type: Boolean,
  },
  {
    name: 'port',
    alias: 'p',
    description: 'Port to bind the server to.',
    type: Number,
  },
  {
    name: 'hostname',
    alias: 'h',
    description: 'Hostname to bind the server to.',
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
    description: 'Whether to log debug messages.',
  },
  {
    name: 'help',
    type: Boolean,
    description: 'List all possible commands.',
  },
];

export interface ReadCliArgsParams {
  argv?: string[];
}

export function readCliArgs({ argv = process.argv }: ReadCliArgsParams = {}): DevServerCliArgs {
  const cliArgs = commandLineArgs(options, { argv, partial: true });

  // when the open flag is used without arguments, it defaults to null. treat this as "true"
  if ('open' in cliArgs && typeof cliArgs.open !== 'string') {
    cliArgs.open = true;
  }

  if ('help' in cliArgs) {
    /* eslint-disable-next-line no-console */
    console.log(
      commandLineUsage([
        {
          header: 'Web Dev Server',
          content: 'Dev Server for web development.',
        },
        {
          header: 'Usage',
          content: 'web-dev-server [options...]' + '\nwds [options...]',
        },
        { header: 'Options', optionList: options },
      ]),
    );
    process.exit();
  }

  const cliArgsConfig: DevServerCliArgs = {};

  for (const [key, value] of Object.entries(cliArgs)) {
    cliArgsConfig[camelCase(key) as keyof DevServerCliArgs] = value;
  }

  return cliArgsConfig;
}
