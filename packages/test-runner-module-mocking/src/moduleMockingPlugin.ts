import { Plugin } from '@web/dev-server-core';
import { parse } from 'es-module-lexer';
import { createResolveImport, ResolveImport } from './createResolveImport.js';
import { stripColor } from './stripColor.js';

/**
 * Plugin that enables mocking of modules
 */
export function moduleMockingPlugin(): Plugin {
  const absolutePaths: string[] = [];

  let resolveImport: ResolveImport;
  return {
    name: 'module-mocking',

    serverStart(params) {
      resolveImport = createResolveImport(params, this);
    },
    async serve(context) {
      let body;
      try {
        if (context.path.endsWith('/__intercept-module__')) {
          const source = (context.querystring[0] === '/' ? '.' : '') + context.querystring;
          const resolvedPath = await resolveImport({ context, source });

          if (!resolvedPath) {
            throw new Error(`Could not resolve "${context.querystring}".`);
          }

          body = `export * from '${resolvedPath}?intercept-module'`;
        } else if (context.querystring === 'intercept-module') {
          const url = new URL(context.path, context.request.href);
          const response = await fetch(url);
          const content = await response.text();
          const [, exports] = await parse(content, context.path);

          const namedExports = exports.map(e => e.n).filter(n => n !== 'default');
          const hasDefaultExport = exports.some(e => e.n === 'default');

          body = `
          import * as original from '${url.pathname}';
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
        }
      } catch (error) {
        // Server side errors might contain ANSI color escape sequences.
        // These sequences are not readable in a browser's console, so we strip them.
        const errorMessage = stripColor((error as Error).message).replace(/'/g, "\\'");
        body = `export const __wtr_error__ = '${errorMessage}';`;
      }

      return body ? { body, type: 'text/javascript' } : undefined;
    },

    resolveImport({ source, context }) {
      if (context.path === '/__intercept-module__') {
        absolutePaths.push(source);
      } else if (absolutePaths.includes(source)) {
        return `${source}?intercept-module`;
      }
      return undefined;
    },
  };
}
