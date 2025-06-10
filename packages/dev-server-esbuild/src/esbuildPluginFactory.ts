import { Plugin } from '@web/dev-server-core';
import { Loader } from 'esbuild';
import { EsbuildPlugin } from './EsbuildPlugin.js';

export interface EsBuildPluginArgs {
  target?: string | string[];
  js?: boolean;
  ts?: boolean;
  json?: boolean;
  jsx?: boolean;
  tsx?: boolean;
  jsxFactory?: string;
  jsxFragment?: string;
  loaders?: Record<string, Loader>;
  define?: { [key: string]: string };
  tsconfig?: string;
  banner?: string;
  footer?: string;
}

export function esbuildPlugin(args: EsBuildPluginArgs = {}): Plugin {
  const target = args.target ?? 'auto';
  const loaders: Record<string, Loader> = {};
  for (const [key, value] of Object.entries(args.loaders ?? {})) {
    loaders[key.startsWith('.') ? key : `.${key}`] = value;
  }
  if (args.ts) {
    loaders['.ts'] = 'ts';
  }
  if (args.jsx) {
    loaders['.jsx'] = 'jsx';
  }
  if (args.tsx) {
    loaders['.tsx'] = 'tsx';
  }
  if (args.json) {
    loaders['.json'] = 'json';
  }
  if (args.js) {
    loaders['.js'] = 'js';
  }
  if (
    !Object.prototype.hasOwnProperty.call(loaders, '.js') &&
    (typeof args.target === 'string' || Array.isArray(args.target))
  ) {
    loaders['.js'] = 'js';
  }

  const handledExtensions = Object.keys(loaders);
  const tsFileExtensions: string[] = [];
  for (const [extension, loader] of Object.entries(loaders)) {
    if (loader === 'ts' || loader === 'tsx') {
      tsFileExtensions.push(extension);
    }
  }

  return new EsbuildPlugin({
    loaders,
    target,
    handledExtensions,
    tsFileExtensions,
    jsxFactory: args.jsxFactory,
    jsxFragment: args.jsxFragment,
    define: args.define,
    tsconfig: args.tsconfig,
    banner: args.banner,
    footer: args.footer,
  });
}
