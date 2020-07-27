import fs from 'fs';
import path from 'path';

const serializeScript = fs.readFileSync(path.resolve(__dirname, 'serialize.js'), 'utf-8');
const logUncaughtErrorsScript = fs.readFileSync(
  path.resolve(__dirname, 'logUncaughtErrors.js'),
  'utf-8',
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
