import { StorybookConfig } from '../config/StorybookConfig';

export function createManagerHtml(config: StorybookConfig) {
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
    ${config.managerHead ?? ''}
  </head>

  <body>
    <div id="root"></div>
    <div id="docs-root"></div>
    <script type="module">
      import '@web/storybook-prebuilt/manager.js';
      ${config.mainJs.addons ? config.mainJs.addons.map(a => `import '${a}';`).join('') : ''}
    </script>
  </body>
</html>`;
}
