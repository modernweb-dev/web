const PLUGIN = '[@web/rollup-plugin-html]';

export const NOOP_IMPORT = '@web/rollup-plugin-html-noop';

export function createError(msg: string) {
  return new Error(`${PLUGIN} ${msg}`);
}
