// based on https://github.com/storybookjs/storybook/blob/v8.5.0/code/builders/builder-vite/src/transform-iframe-html.ts

import { normalizeStories } from '@storybook/core-common';
import type { DocsOptions, Options, TagsOptions } from '@storybook/types';
import { readFile } from 'node:fs/promises';
import { virtualAppFilename } from './virtual-file-names.js';

export type PreviewHtml = string | undefined;

export async function generateIframeHtml(options: Options): Promise<string> {
  const iframeHtmlTemplate = await readFile(require.resolve('../static/iframe-template.html'), {
    encoding: 'utf-8',
  });
  const { configType, features, presets } = options;
  const build = await presets.apply('build');
  const frameworkOptions = await presets.apply<Record<string, any> | null>('frameworkOptions');
  const headHtmlSnippet = await presets.apply<PreviewHtml>('previewHead');
  const bodyHtmlSnippet = await presets.apply<PreviewHtml>('previewBody');
  const logLevel = await presets.apply('logLevel', undefined);
  const docsOptions = await presets.apply<DocsOptions>('docs');
  const tagsOptions = await presets.apply<TagsOptions>('tags');
  const coreOptions = await presets.apply('core');
  const stories = normalizeStories(await options.presets.apply('stories', [], options), {
    configDir: options.configDir,
    workingDir: process.cwd(),
  }).map(specifier => ({
    ...specifier,
    importPathMatcher: specifier.importPathMatcher.source,
  }));
  const otherGlobals = {
    ...(build?.test?.disableBlocks ? { __STORYBOOK_BLOCKS_EMPTY_MODULE__: {} } : {}),
  };
  return iframeHtmlTemplate
    .replace('[CONFIG_TYPE HERE]', configType || '')
    .replace('[LOGLEVEL HERE]', logLevel || '')
    .replace(`'[FRAMEWORK_OPTIONS HERE]'`, JSON.stringify(frameworkOptions))
    .replace(
      `('OTHER_GLOBLALS HERE');`,
      Object.entries(otherGlobals)
        .map(([k, v]) => `window["${k}"] = ${JSON.stringify(v)};`)
        .join(''),
    )
    .replace(
      `'[CHANNEL_OPTIONS HERE]'`,
      JSON.stringify(coreOptions && coreOptions.channelOptions ? coreOptions.channelOptions : {}),
    )
    .replace(`'[FEATURES HERE]'`, JSON.stringify(features || {}))
    .replace(`'[STORIES HERE]'`, JSON.stringify(stories || {}))
    .replace(`'[DOCS_OPTIONS HERE]'`, JSON.stringify(docsOptions || {}))
    .replace(`'[TAGS_OPTIONS HERE]'`, JSON.stringify(tagsOptions || {}))
    .replace('<!-- [HEAD HTML SNIPPET HERE] -->', headHtmlSnippet || '')
    .replace('<!-- [BODY HTML SNIPPET HERE] -->', bodyHtmlSnippet || '')
    .replace(`[APP MODULE SRC HERE]`, virtualAppFilename);
}
