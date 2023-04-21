import fs from 'fs';
import { StorybookConfig } from '../config/StorybookConfig';
import { createBrowserImport } from '../utils';

function createManagerImport(rootDir: string, managerJsPath: string) {
  if (!fs.existsSync(managerJsPath)) {
    return '';
  }
  const managerImport = createBrowserImport(rootDir, managerJsPath);
  return `import '${managerImport}';`;
}

export function createManagerHtml(storybookConfig: StorybookConfig, rootDir: string) {
  const managerImport = createManagerImport(rootDir, storybookConfig.managerJsPath);
  const addonImports = storybookConfig.mainJs.addons
    ? storybookConfig.mainJs.addons.map(a => `import '${a}';`).join('')
    : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Storybook</title>

    <style>
      html,
      body {
        overflow: hidden;
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
      }
    </style>

    <style>
      #root[hidden],
      #docs-root[hidden] {
        display: none !important;
      }
    </style>
    ${storybookConfig.managerHead ?? ''}
  </head>

  <body>
    <div id="root"></div>
    <div id="docs-root"></div>
    <script type="module">
      import '@web/storybook-prebuilt/manager.js';
      ${managerImport}
      ${addonImports}
    </script>
  </body>
</html>`;
}
