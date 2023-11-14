import { Plugin } from '@web/dev-server-core';
import { readFile } from 'fs/promises';
import { parse } from 'es-module-lexer';
import { createResolveImport, ResolveImport } from './createResolveImport';
import { stripColor } from './stripColor';

/**
 * Plugin that allows the interception of modules
 */
export function interceptModulePlugin(): Plugin {
  const paths: string[] = [];

  let resolveImport: ResolveImport;
  return {
    name: 'intercept-module',

    serverStart(params) {
      resolveImport = createResolveImport(params, this);
    },
    async serve(context) {
      if (context.path.startsWith('/__intercept-module__/')) {
        let body;
        try {
          const source = context.path.replace('/__intercept-module__/', '');
          paths.push(source);

          const resolvedPath = await resolveImport({ context, source });
          const url = new URL(resolvedPath as string, context.request.href);
          const relativeFilePath = url.pathname.substring(1);

          const content = await readFile(relativeFilePath, 'utf-8');
          const [, exports] = await parse(content, resolvedPath as string);

          const namedExports = exports.map(e => e.n).filter(n => n !== 'default');
          const hasDefaultExport = exports.some(e => e.n === 'default');

          body = `
          import * as original from '${resolvedPath}';
          const newOriginal = {...original};

          ${namedExports.map(x => `export let ${x} = newOriginal['${x}'];`).join('\n')}

          ${
            hasDefaultExport
              ? `
          function computeDefault() {
            if(typeof newOriginal.default === 'function'){
              return (...args) => newOriginal.default.call(undefined, ...args);
            }
            return newOriginal.default;
          }

          export default computeDefault()
          `
              : ''
          }

          export const __wtr_intercepted_module__ = new Proxy(newOriginal, {
            set: function(obj, prop, value) {
              ${namedExports.map(x => `if (prop === '${x}') { ${x} = value;}`).join('\n')}
              return Reflect.set(obj, prop, value);
            },
            defineProperty(target, key, descriptor) {
              ${namedExports.map(x => `if (key === '${x}') { ${x} = descriptor.value;}`).join('\n')}
              return Reflect.defineProperty(target, key, descriptor);
            },
          });
        `;
        } catch (error) {
          // Server side errors might contain ANSI color escape sequences.
          // These sequences are not readable in a browser's console, so we strip them. 
          const errorMessage = stripColor((error as Error).message).replaceAll("'", "\\'");
          body = `export const __wtr_error__ = '${errorMessage}';`;
        }
        return { body, type: 'text/javascript' };
      }
      return undefined;
    },

    resolveImport({ source }) {
      if (paths.includes(source)) {
        return `/__intercept-module__/${source}`;
      }
      return undefined;
    },
  };
}
