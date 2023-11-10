import { normalizeStories } from '@storybook/core-common';
import type { CoreConfig, Options } from '@storybook/types';
import { readFile } from 'fs-extra';
import { virtualAppFilename } from './virtual-file-names.js';

export type PreviewHtml = string | undefined;

export async function generateIframeHtml(options: Options): Promise<string> {
  const iframeHtmlTemplate = await readFile(
    require.resolve('../static/iframe-template.html'),
    'utf-8',
  );
  const { configType, features, presets, serverChannelUrl } = options;
  const frameworkOptions = await presets.apply<Record<string, any> | null>('frameworkOptions');
  const headHtmlSnippet = await presets.apply<PreviewHtml>('previewHead');
  const bodyHtmlSnippet = await presets.apply<PreviewHtml>('previewBody');
  const logLevel = await presets.apply('logLevel', undefined);
  // const docsOptions = await presets.apply<DocsOptions>('docs');
  const coreOptions = await presets.apply<CoreConfig>('core');
  const stories = normalizeStories(await options.presets.apply('stories', [], options), {
    configDir: options.configDir,
    workingDir: process.cwd(),
  }).map(specifier => ({
    ...specifier,
    importPathMatcher: specifier.importPathMatcher.source,
  }));
  return (
    iframeHtmlTemplate
      .replace('[CONFIG_TYPE HERE]', configType || '')
      .replace('[LOGLEVEL HERE]', logLevel || '')
      .replace(`'[FRAMEWORK_OPTIONS HERE]'`, JSON.stringify(frameworkOptions))
      .replace(
        `'[CHANNEL_OPTIONS HERE]'`,
        JSON.stringify(coreOptions && coreOptions.channelOptions ? coreOptions.channelOptions : {}),
      )
      .replace(`'[FEATURES HERE]'`, JSON.stringify(features || {}))
      .replace(`'[STORIES HERE]'`, JSON.stringify(stories || {}))
      // .replace(`'[DOCS_OPTIONS HERE]'`, JSON.stringify(docsOptions || {}))
      .replace(`'[SERVER_CHANNEL_URL HERE]'`, JSON.stringify(serverChannelUrl))
      .replace('<!-- [HEAD HTML SNIPPET HERE] -->', headHtmlSnippet || '')
      .replace('<!-- [BODY HTML SNIPPET HERE] -->', bodyHtmlSnippet || '')
      .replace(`[APP MODULE SRC HERE]`, virtualAppFilename)
  );
}
