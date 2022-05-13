import { Plugin } from '@web/dev-server-core';
import { JscTarget } from '@swc/core';
import { Loader, SWCPlugin } from './SWCPlugin';

export interface SWCPluginArgs {
  target?: JscTarget;
  js?: boolean;
  ts?: boolean;
  jsx?: boolean;
  tsx?: boolean;
  jsxFactory?: string;
  jsxFragment?: string;
  define?: { [key: string]: string };
}

export function swcPlugin(args: SWCPluginArgs = {}): Plugin {
  const target = args.target ?? 'es2022';
  const loaders: Record<string, Loader> = {};
  if (args.ts) {
    loaders['.ts'] = 'ts';
  }
  if (args.jsx) {
    loaders['.jsx'] = 'jsx';
  }
  if (args.tsx) {
    loaders['.tsx'] = 'tsx';
  }
  if (args.js) {
    loaders['.js'] = 'js';
  }
  if (!Object.prototype.hasOwnProperty.call(loaders, '.js')) {
    loaders['.js'] = 'js';
  }

  const handledExtensions = Object.keys(loaders);
  const tsFileExtensions: string[] = [];
  for (const [extension, loader] of Object.entries(loaders)) {
    if (loader === 'ts' || loader === 'tsx') {
      tsFileExtensions.push(extension);
    }
  }

  return new SWCPlugin({
    loaders,
    target,
    handledExtensions,
    tsFileExtensions,
    jsxFactory: args.jsxFactory,
    jsxFragment: args.jsxFragment,
  });
}
