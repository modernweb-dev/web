// TODO: import from @web/dev-server-core
import { Context } from 'koa';
import { Loader } from 'esbuild';

import { EsBuildPluginArgs } from './esbuildPlugin';

export function getEsbuildLoader(context: Context, args: EsBuildPluginArgs): Loader | null {
  if (context.path.endsWith('.ts') && (args?.loaders?.ts || args.ts)) {
    return args?.loaders?.ts ?? 'ts';
  }
  if (context.path.endsWith('.tsx') && (args?.loaders?.tsx || args.tsx)) {
    return args?.loaders?.tsx ?? 'tsx';
  }
  if (context.path.endsWith('.jsx') && (args?.loaders?.jsx || args.jsx)) {
    return args?.loaders?.jsx ?? 'jsx';
  }
  if (context.response.is('js') && (args?.loaders?.js || args.js)) {
    return args?.loaders?.js ?? 'js';
  }
  return null;
}
