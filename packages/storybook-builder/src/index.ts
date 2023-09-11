import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
import { getBuilderOptions } from '@storybook/core-common';
import { logger } from '@storybook/node-logger';
import { globals } from '@storybook/preview/globals';
import type { Builder, Options, StorybookConfig as StorybookConfigBase } from '@storybook/types';
import { DevServerConfig, mergeConfigs, startDevServer } from '@web/dev-server';
import type { DevServer } from '@web/dev-server-core';
import { fromRollup } from '@web/dev-server-rollup';
import { rollupPluginHTML } from '@web/rollup-plugin-html';
import express from 'express';
import * as fs from 'fs-extra';
import { join, parse, resolve } from 'path';
import { OutputOptions, RollupBuild, RollupOptions, rollup } from 'rollup';
import rollupPluginExternalGlobals from 'rollup-plugin-external-globals';
import { generateIframeHtml } from './generate-iframe-html';
import { getNodeModuleDir } from './get-node-module-dir';
import { readFileConfig } from './read-file-config';
import {
  PREBUNDLED_MODULES_DIR,
  rollupPluginPrebundleModules,
} from './rollup-plugin-prebundle-modules';
import { rollupPluginStorybookBuilder } from './rollup-plugin-storybook-builder';

const wdsPluginExternalGlobals = fromRollup(rollupPluginExternalGlobals);
const wdsPluginPrebundleModules = fromRollup(rollupPluginPrebundleModules);
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

export const start: WdsBuilder['start'] = async ({ startTime, options, router }) => {
  const previewDirOrigin = join(getNodeModuleDir('@storybook/preview'), 'dist');
  router.use('/sb-preview', express.static(previewDirOrigin, { immutable: true, maxAge: '5m' }));
  router.use(`/${PREBUNDLED_MODULES_DIR}`, express.static(resolve(`./${PREBUNDLED_MODULES_DIR}`)));

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
      wdsPluginPrebundleModules(env),
      wdsPluginStorybookBuilder(options),
      wdsPluginExternalGlobals(globals),
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
  wdsFinalConfig.middlewareMode = true;
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
        // default assets behavior of the plugin breaks, sb-common-assets are shared between manager and preview and copied separately
        extractAssets: false,
      }),
      rollupPluginNodeResolve(),
      rollupPluginPrebundleModules(env),
      rollupPluginStorybookBuilder(options),
      rollupPluginExternalGlobals(globals),
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

  const previewDirOrigin = join(getNodeModuleDir('@storybook/preview'), 'dist');
  const previewDirTarget = join(options.outputDir || '', `sb-preview`);
  const previewFiles = fs.copy(previewDirOrigin, previewDirTarget, {
    filter: src => {
      const { ext } = parse(src);
      if (ext) {
        return ext === '.js';
      }
      return true;
    },
  });

  await Promise.all([rollupBuild, previewFiles]);
};
