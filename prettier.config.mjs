/**
 * @type {import("prettier-plugin-embed").PluginEmbedOptions}
 */
const pluginEmbedOptions = {
  embeddedHtmlComments: [],
  embeddedHtmlTags: [],
};

/** @type {import('prettier').Config} */
const config = {
  plugins: [
    '@prettier/plugin-xml',
    'prettier-plugin-embed',
    'prettier-plugin-package',
    'prettier-plugin-organize-imports',
  ],
  singleQuote: true,
  arrowParens: 'avoid',
  printWidth: 100,
  trailingComma: 'all',
  ...pluginEmbedOptions,
};

export default config;
