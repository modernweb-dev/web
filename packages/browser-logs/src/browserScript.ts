import fs from 'fs';
import path from 'path';

const REGEXP_SOURCE_MAP = /\/\/# sourceMappingURL=.*/;

const serializeScript = fs
  .readFileSync(path.resolve(import.meta.dirname, 'serialize.js'), 'utf-8')
  .replace(REGEXP_SOURCE_MAP, '');
const logUncaughtErrorsScript = fs
  .readFileSync(path.resolve(import.meta.dirname, 'logUncaughtErrors.js'), 'utf-8')
  .replace(REGEXP_SOURCE_MAP, '');

/**
 * Create the browser script as an IIFE wrapper.
 * It can't be ESM because it should work on older browsers as well.
 */
export const browserScript =
  '(function () { var module={};var exports={};\n' +
  `${serializeScript}\n${logUncaughtErrorsScript}\n` +
  '\nwindow.__wtr_browser_logs__ = { serialize }; })();';
