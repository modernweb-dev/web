import * as _rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
const rollupPluginNodeResolve =
  (_rollupPluginNodeResolve as any).default ?? _rollupPluginNodeResolve;
import * as _rollupPluginReplace from '@rollup/plugin-replace';
const rollupPluginReplace = (_rollupPluginReplace as any).default ?? _rollupPluginReplace;
import { getBuilderOptions } from '@storybook/core-common';
import { logger } from '@storybook/node-logger';
// @ts-ignore - globalPackages was previously named globals
import { globalPackages, globalsNameReferenceMap } from '@storybook/preview/globals';
import type { Builder, Options, StorybookConfig as StorybookConfigBase } from '@storybook/types';
import { type DevServerConfig, mergeConfigs, startDevServer } from '@web/dev-server';
import type { DevServer } from '@web/dev-server-core';
import { fromRollup } from '@web/dev-server-rollup';
import { rollupPluginHTML } from '@web/rollup-plugin-html';
import { cp } from 'node:fs/promises';
import { join, parse, resolve } from 'node:path';
import { type OutputOptions, type RollupBuild, type RollupOptions, rollup } from 'rollup';
// @ts-ignore CJS module with export= syntax
import rollupPluginExternalGlobals from 'rollup-plugin-external-globals';
import sirv from 'sirv';
import { generateIframeHtml } from './generate-iframe-html.ts';
import { getNodeModuleDir } from './get-node-module-dir.ts';
import { readFileConfig } from './read-file-config.ts';
import { rollupPluginMdx } from './rollup-plugin-mdx.ts';
import {
  PREBUNDLED_MODULES_DIR,
  rollupPluginPrebundleModules,
} from './rollup-plugin-prebundle-modules.ts';
import { rollupPluginStorybookBuilder } from './rollup-plugin-storybook-builder.ts';
import { stringifyProcessEnvs } from './stringify-process-envs.ts';

// @ts-ignore CJS interop
const wdsPluginExternalGlobals = fromRollup(rollupPluginExternalGlobals);
const wdsPluginMdx = fromRollup(rollupPluginMdx);
const wdsPluginPrebundleModules = fromRollup(rollupPluginPrebundleModules);
const wdsPluginReplace = fromRollup(rollupPluginReplace);
const wdsPluginStorybookBuilder = fromRollup(rollupPluginStorybookBuilder);

export type StorybookConfigWds = StorybookConfigBase & {
  wdsFinal?: (
    config: DevServerConfig,
    options: Options,
  ) => DevServerConfig | Promise<DevServerConfig>;
  rollupFinal?: (config: RollupOptions, options: Options) => RollupOptions | Promise<RollupOptions>;
};

export type BuilderOptions = {
  /**
   * Path to @web/dev-server config file, relative to CWD.
   */
  wdsConfigPath?: string;
};

// Storybook's Stats are optional Webpack related property
type WdsStats = {
  toJson: () => any;
};

export type WdsBuilder = Builder<DevServerConfig, WdsStats>;

let wdsServer: DevServer;

export const bail: WdsBuilder['bail'] = async () => {
  await wdsServer?.stop();
};

export const start: WdsBuilder['start'] = async ({ startTime, options, router, server }) => {
  const previewDirOrigin = join(getNodeModuleDir('@storybook/core'), 'dist', 'preview');
  router.use(
    '/sb-preview',
    sirv(previewDirOrigin, {
      maxAge: 300000,
      dev: true,
      immutable: true,
    }),
  );
  router.use(
    `/${PREBUNDLED_MODULES_DIR}`,
    sirv(resolve(`./${PREBUNDLED_MODULES_DIR}`), { dev: true }),
  );

  const env = await options.presets.apply<Record<string, string>>('env');

  const wdsStorybookConfig: DevServerConfig = {
    nodeResolve: true,
    plugins: [
      {
        name: 'storybook-iframe-html',
        async serve(context) {
          if (context.path === '/iframe.html') {
            const iframeHtml = await generateIframeHtml(options);
            return { type: 'html', body: iframeHtml };
          }
        },
      },
      wdsPluginPrebundleModules(env, options),
      wdsPluginStorybookBuilder(options),
      wdsPluginMdx(options),
      wdsPluginExternalGlobals(globalsNameReferenceMap || globalPackages),
      wdsPluginReplace({
        ...stringifyProcessEnvs(env),
        include: ['**/node_modules/@storybook/**/*'],
        preventAssignment: true,
      }),
    ],
  };

  const { wdsConfigPath } = await getBuilderOptions<BuilderOptions>(options);
  const wdsUserConfig = await readFileConfig(wdsConfigPath);

  const wdsFinalConfig = await options.presets.apply<DevServerConfig>(
    'wdsFinal',
    mergeConfigs(wdsUserConfig, wdsStorybookConfig, {
      // reset local config "open" as it should not be used for storybook specific configuration
      open: false,
    }),
    options,
  );

  // if "wdsFinal" added "open" then rewrite it to open on storybook host (unless it's a full URL)
  if (
    wdsFinalConfig.open &&
    typeof wdsFinalConfig.open === 'string' &&
    !wdsFinalConfig.open.match(/^https?:\/\//)
  ) {
    const protocol = options.https ? 'https' : 'http';
    const host = options.host || 'localhost';
    const port = options.port;
    wdsFinalConfig.open = `${protocol}://${host}:${port}${wdsFinalConfig.open}`;
  }

  // setup middleware mode
  wdsFinalConfig.middlewareMode = {
    server,
  };
  wdsFinalConfig.port = undefined;
  wdsFinalConfig.hostname = undefined;

  wdsServer = await startDevServer({
    // we load and merge configs manually
    readFileConfig: false,
    readCliArgs: false,
    autoExitProcess: false,
    logStartMessage: false,
    config: wdsFinalConfig,
  });

  router.use(wdsServer.koaApp.callback());

  return {
    bail,
    stats: { toJson: () => null },
    totalTime: process.hrtime(startTime),
  };
};

export const build: WdsBuilder['build'] = async ({ startTime, options }) => {
  const env = await options.presets.apply<Record<string, string>>('env');

  const rollupDefaultOutputOptions: OutputOptions = {
    dir: options.outputDir,
  };

  const rollupStorybookConfig: RollupOptions = {
    output: rollupDefaultOutputOptions,
    external: ['./sb-preview/runtime.js'],
    plugins: [
      rollupPluginHTML({
        input: { html: await generateIframeHtml(options), name: 'iframe.html' },
        extractAssets: true,
        externalAssets: 'sb-common-assets/**',
      }),
      rollupPluginNodeResolve(),
      rollupPluginPrebundleModules(env, options),
      rollupPluginStorybookBuilder(options),
      rollupPluginMdx(options),
      // @ts-ignore CJS interop
      rollupPluginExternalGlobals(globalsNameReferenceMap || globalPackages),
      rollupPluginReplace({
        ...stringifyProcessEnvs(env),
        include: ['**/node_modules/@storybook/**/*'],
        preventAssignment: true,
      }),
    ],
  };

  const rollupFinalConfig = await options.presets.apply<RollupOptions>(
    'rollupFinal',
    rollupStorybookConfig,
    options,
  );

  const rollupBuild = (async () => {
    logger.info('=> Building preview..');
    let bundle: RollupBuild | undefined;
    try {
      bundle = await rollup(rollupFinalConfig);
      if (rollupFinalConfig.output) {
        const outputOptionsArray = Array.isArray(rollupFinalConfig.output)
          ? rollupFinalConfig.output
          : [rollupFinalConfig.output];
        for (const outputOptions of outputOptionsArray) {
          await bundle.write(outputOptions);
        }
      }
    } finally {
      if (bundle) {
        bundle.close();
      }
    }
    logger.trace({ message: '=> Preview built', time: process.hrtime(startTime) });
  })();

  const previewDirOrigin = join(getNodeModuleDir('@storybook/core'), 'dist', 'preview');
  const previewDirTarget = join(options.outputDir || '', `sb-preview`);
  const previewFiles = cp(previewDirOrigin, previewDirTarget, {
    filter: src => {
      const { ext } = parse(src);
      if (ext) {
        return ext === '.js';
      }
      return true;
    },
    recursive: true,
  });

  await Promise.all([rollupBuild, previewFiles]);
};
