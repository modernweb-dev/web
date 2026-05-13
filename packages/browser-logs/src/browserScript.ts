import fs from 'fs';
import path from 'path';

const REGEXP_SOURCE_MAP = /\/\/# sourceMappingURL=.*/;
// ESM export declarations must be stripped since the scripts are inlined inside an IIFE
const REGEXP_ESM_EXPORT = /^export\s+(?:default\s+)?(?:function|class|const|let|var|async\s+function)\s+/gm;
const REGEXP_ESM_EXPORT_EMPTY = /^export\s*\{\s*\}\s*;?\s*$/gm;

function stripEsmExports(code: string): string {
  return code
    .replace(REGEXP_ESM_EXPORT_EMPTY, '')
    .replace(REGEXP_ESM_EXPORT, match => match.replace(/^export\s+/, ''));
}

const serializeScript = stripEsmExports(
  fs
    .readFileSync(path.resolve(import.meta.dirname, 'serialize.js'), 'utf-8')
    .replace(REGEXP_SOURCE_MAP, ''),
);
const logUncaughtErrorsScript = stripEsmExports(
  fs
    .readFileSync(path.resolve(import.meta.dirname, 'logUncaughtErrors.js'), 'utf-8')
    .replace(REGEXP_SOURCE_MAP, ''),
);

/**
 * Create the browser script. This project is compiled as CJS because it also needs to run in node, so
 * we create a small wrapper.
 *
 * It can't be ESM anyway, because it should work on older browsers as well.
 */
export const browserScript =
  '(function () { var module={};var exports={};\n' +
  `${serializeScript}\n${logUncaughtErrorsScript}\n` +
  '\nwindow.__wtr_browser_logs__ = { serialize }; })();';
