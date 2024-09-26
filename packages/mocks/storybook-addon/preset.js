/**
 * @param {import('@web/dev-server').DevServerConfig} config
 */
export async function wdsFinal(config) {
  const { mockPlugin } = await import('@web/mocks/plugins.js');
  // @ts-expect-error
  config.plugins.push(mockPlugin());
  return config;
}

/**
 * @param {import('rollup').RollupOptions} config
 */
export async function rollupFinal(config) {
  const { mockRollupPlugin } = await import('@web/mocks/plugins.js');
  // @ts-expect-error
  config.plugins.push(mockRollupPlugin());
  return config;
}
