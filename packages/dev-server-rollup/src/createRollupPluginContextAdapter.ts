import path from 'path';
import {
  DevServerCoreConfig,
  FSWatcher,
  Plugin as WdsPlugin,
  Context,
  ResolveOptions,
} from '@web/dev-server-core';
import {
  PluginContext,
  MinimalPluginContext,
  TransformPluginContext,
  CustomPluginOptions,
  ModuleInfo,
} from 'rollup';

export function createRollupPluginContextAdapter<
  T extends PluginContext | MinimalPluginContext | TransformPluginContext,
>(
  pluginContext: T,
  wdsPlugin: WdsPlugin,
  config: DevServerCoreConfig,
  fileWatcher: FSWatcher,
  context: Context,
  pluginMetaPerModule: Map<string, CustomPluginOptions>,
) {
  return {
    ...pluginContext,

    getModuleInfo(id: string): Partial<ModuleInfo> {
      return {
        id,
        code: context.body as string,
        ast: null,
        dynamicallyImportedIds: [],
        dynamicallyImportedIdResolutions: [],
        dynamicImporters: [],
        hasDefaultExport: false,
        implicitlyLoadedBefore: [],
        implicitlyLoadedAfterOneOf: [],
        importedIds: [],
        importedIdResolutions: [],
        importers: [],
        isEntry: false,
        isExternal: false,
        isIncluded: false,
        moduleSideEffects: false,
        syntheticNamedExports: false,
        meta: pluginMetaPerModule.get(id) ?? {},
      };
    },

    addWatchFile(id: string) {
      const filePath = path.join(process.cwd(), id);
      fileWatcher.add(filePath);
    },

    emitAsset() {
      throw new Error('Emitting files is not yet supported');
    },

    emitFile() {
      throw new Error('Emitting files is not yet supported');
    },

    getAssetFileName() {
      throw new Error('Emitting files is not yet supported');
    },

    getFileName() {
      throw new Error('Emitting files is not yet supported');
    },

    setAssetSource() {
      throw new Error('Emitting files is not yet supported');
    },

    async resolve(source: string, importer: string, options: ResolveOptions) {
      if (!context) throw new Error('Context is required.');

      const { skipSelf, ...resolveOptions } = options;

      if (skipSelf) wdsPlugin.resolveImportSkip?.(context, source, importer);

      for (const pl of config.plugins ?? []) {
        if (pl.resolveImport && (!skipSelf || pl !== wdsPlugin)) {
          const result = await pl.resolveImport({
            source,
            context,
            resolveOptions,
          });
          let resolvedId: string | undefined;
          if (typeof result === 'string') {
            resolvedId = result;
          } else if (typeof result === 'object') {
            resolvedId = result?.id;
          }

          if (resolvedId) {
            const importerDir = path.dirname(importer);

            return {
              id: path.isAbsolute(resolvedId) ? resolvedId : path.join(importerDir, resolvedId),
            };
          }
        }
      }
    },

    async resolveId(
      source: string,
      importer: string,
      options: { isEntry: boolean; skipSelf: boolean; custom: Record<string, unknown> },
    ) {
      const resolveResult = await this.resolve(source, importer, options);
      if (typeof resolveResult === 'string') {
        return resolveResult;
      }
      if (typeof resolveResult === 'object') {
        return resolveResult?.id;
      }
      return resolveResult;
    },
  };
}
