import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';

/** @type { import('../../../../index.d.ts').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.js', '../stories/**/*.mdx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@web/storybook-framework-web-components',
  },
  rollupFinal(config) {
    return {
      ...config,
      plugins: [...config.plugins, importMetaAssets()],
      onLog(level, log, defaultHandler) {
        // we are only interested in warnings
        if (level !== 'warn') {
          defaultHandler(level, log);
          return;
        }

        // ignore warning about eval which comes from bundled telejson
        if (log.code === 'EVAL') {
          const logId = log.id?.replace(/\\/g, '/');
          if (
            // TODO(storybook): looks like '@storybook/test' bundles too much, including the "@storybook/core"
            // TODO(storybook): exact eval seems to be from get-intrinsic, not from telejson which is weird given telejson is still used
            logId?.includes('node_modules/.prebundled_modules/@storybook/test.mjs') ||
            logId?.includes('node_modules/@storybook/core/dist/preview/runtime.js')
          ) {
            defaultHandler('warn', log);
            return;
          }
        }

        // log all other warnings as errors
        defaultHandler('error', log);
      },
    };
  },
};
export default config;
