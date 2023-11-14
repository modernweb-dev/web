import { Plugin, ServerStartParams, ResolveOptions, Context } from '@web/dev-server-core';

// Copied from packages/dev-server-core/src/plugins/Plugin.ts as it's not exported
export type ResolveResult = void | string | { id?: string };
export interface ResolveImportArguments {
  source: string;
  context: Context;
  code?: string;
  column?: number;
  line?: number;
  resolveOptions?: ResolveOptions;
}
export type ResolveImport = (
  args: ResolveImportArguments,
) => ResolveResult | Promise<ResolveResult>;

/**
 * TODO: check if `resolveImport()` can be provied by `@web/dev-server-core`'s API
 * @param args start param args
 * @param thisPlugin plugin to exclude
 */
export function createResolveImport(
  { config }: ServerStartParams,
  thisPlugin: Plugin,
): ResolveImport {
  const resolvePlugins =
    config.plugins?.filter?.(pl => pl.resolveImport && pl !== thisPlugin) ?? [];

  return async function resolveImport(args: ResolveImportArguments) {
    for (const plugin of resolvePlugins) {
      const resolved = await plugin?.resolveImport?.(args);
      if (typeof resolved === 'string') {
        return resolved;
      }

      if (typeof resolved === 'object') {
        return resolved?.id;
      }
    }
  };
}
