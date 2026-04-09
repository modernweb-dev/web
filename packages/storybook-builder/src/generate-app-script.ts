// based on https://github.com/storybookjs/storybook/blob/v9.1.20/code/builders/builder-vite/src/codegen-modern-iframe-script.ts

import { loadPreviewOrConfigFile } from 'storybook/internal/common';
import type { Options, PreviewAnnotation } from 'storybook/internal/types';
import { virtualSetupAddonsFilename, virtualStoriesFilename } from './virtual-file-names.js';

export async function generateAppScript(options: Options) {
  const slash = (await import('slash')).default; // for CJS compatibility

  const { presets, configDir } = options;

  const previewOrConfigFile = loadPreviewOrConfigFile({ configDir });
  const previewAnnotations = await presets.apply<PreviewAnnotation[]>(
    'previewAnnotations',
    [],
    options,
  );

  const previewAnnotationURLs = [...previewAnnotations, previewOrConfigFile]
    .filter((path): path is PreviewAnnotation => !!path)
    .map((path: PreviewAnnotation) => (typeof path === 'object' ? path.bare : path));

  // This is pulled out to a variable because it is reused in both the initial page load
  // and the HMR handler.  We don't use the hot.accept callback params because only the changed
  // modules are provided, the rest are null.  We can just re-import everything again in that case.
  const getPreviewAnnotationsFunction = `
const getProjectAnnotations = async () => {
  const configs = await Promise.all([
${previewAnnotationURLs
  .map(previewAnnotation => `    import('${slash(previewAnnotation)}')`)
  .join(',\n')}
  ]);
  return composeConfigs(configs);
}
  `.trim();

  return `
import { setup } from 'storybook/internal/preview/runtime';
import '${virtualSetupAddonsFilename}';

setup();

import { composeConfigs, PreviewWeb, ClientApi } from 'storybook/preview-api';
import { importFn } from '${virtualStoriesFilename}';

${getPreviewAnnotationsFunction}

window.__STORYBOOK_PREVIEW__ = window.__STORYBOOK_PREVIEW__ || new PreviewWeb(importFn, getProjectAnnotations);

window.__STORYBOOK_STORY_STORE__ = window.__STORYBOOK_STORY_STORE__ || window.__STORYBOOK_PREVIEW__.storyStore;
  `.trim();
}
