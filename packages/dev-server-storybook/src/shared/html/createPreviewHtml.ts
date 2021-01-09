import fs from 'fs';
import { StorybookConfig } from '../config/StorybookConfig';

import { StorybookPluginConfig } from '../config/StorybookPluginConfig';
import { createBrowserImport } from '../utils';

function createPreviewImport(rootDir: string, previewJsPath: string) {
  if (!fs.existsSync(previewJsPath)) {
    return '';
  }
  const previewImport = createBrowserImport(rootDir, previewJsPath);
  return `import * as preview from '${previewImport}'; registerPreviewEntry(preview);`;
}

export function createPreviewHtml(
  pluginConfig: StorybookPluginConfig,
  storybookConfig: StorybookConfig,
  rootDir: string,
  storyImports: string[],
) {
  const previewImport = createPreviewImport(rootDir, storybookConfig.previewJsPath);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Storybook</title>

    <base target="_parent" />

    <style>
      :not(.sb-show-main) > .sb-main,
      :not(.sb-show-nopreview) > .sb-nopreview,
      :not(.sb-show-errordisplay) > .sb-errordisplay {
        display: none;
      }

      .sb-wrapper {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        font-family: 'Nunito Sans', -apple-system, '.SFNSText-Regular', 'San Francisco',
          BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        overflow: auto;
      }

      .sb-heading {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.2px;
        margin: 10px 0;
        padding-right: 25px;
      }

      .sb-nopreview {
        display: flex;
        align-content: center;
        justify-content: center;
      }

      .sb-nopreview_main {
        margin: auto;
        padding: 30px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.03);
      }

      .sb-nopreview_heading {
        text-align: center;
      }

      .sb-errordisplay {
        border: 20px solid rgb(187, 49, 49);
        background: #222;
        color: #fff;
        z-index: 999999;
      }

      .sb-errordisplay_code {
        padding: 10px;
        background: #000;
        color: #eee;
        font-family: 'Operator Mono', 'Fira Code Retina', 'Fira Code', 'FiraCode-Retina',
          'Andale Mono', 'Lucida Console', Consolas, Monaco, monospace;
      }

      .sb-errordisplay pre {
        white-space: pre-wrap;
      }
    </style>

    <script>
      try {
        if (window.top !== window) {
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.top.__REACT_DEVTOOLS_GLOBAL_HOOK__;
          window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = window.top.__VUE_DEVTOOLS_GLOBAL_HOOK__;
          window.top.__VUE_DEVTOOLS_CONTEXT__ = window.document;
        }
      } catch (e) {
        console.warn('unable to connect to top frame for connecting dev tools');
      }
    </script>
    ${storybookConfig.previewHead ?? ''}
  </head>

  <body>
    ${storybookConfig.previewBody ?? ''}
    <div id="root"></div>
    <div id="docs-root"></div>

    <div class="sb-errordisplay sb-wrapper">
      <div id="error-message" class="sb-heading"></div>
      <pre class="sb-errordisplay_code"><code id="error-stack"></code></pre>
    </div>

    <script type="module">
      import { registerPreviewEntry, configure } from '@web/storybook-prebuilt/${
        pluginConfig.type
      }.js';
      ${previewImport}
      ${storyImports.map((s, i) => `import * as stories${i} from '${s}';`).join('')}

      setTimeout(() => {
        configure(() => [${storyImports.map((s, i) => `stories${i}`)}], {}, false);
      });
    </script>
  </body>
</html>`;
}
