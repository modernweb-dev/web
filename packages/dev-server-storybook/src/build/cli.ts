#!/usr/bin/env node
import commandLineArgs from 'command-line-args';
import path from 'path';
import { build } from './build';

async function main() {
  const args = commandLineArgs([
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
    {
      name: 'type',
      alias: 't',
      type: String,
      defaultValue: 'web-components',
    },
  ]);

  const configDir = path.resolve(args['config-dir']);
  const outputDir = path.resolve(args['output-dir']);

  await build({ type: args.type, configDir, outputDir });
}

main();
