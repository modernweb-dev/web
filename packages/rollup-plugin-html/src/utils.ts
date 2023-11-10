import { ScriptModuleTag } from './RollupPluginHTMLOptions.js';

const PLUGIN = '[@web/rollup-plugin-html]';

export const NOOP_IMPORT: ScriptModuleTag = { importPath: '@web/rollup-plugin-html-noop' };

export function createError(msg: string) {
  return new Error(`${PLUGIN} ${msg}`);
}
