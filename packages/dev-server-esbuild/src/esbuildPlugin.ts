import { startService, Service, Loader, Message, Target } from 'esbuild';
import { Context } from 'koa';
import path from 'path';
import { Plugin } from 'es-dev-server';
import chalk from 'chalk';
import { codeFrameColumns } from '@babel/code-frame';
import { URL, pathToFileURL, fileURLToPath } from 'url';

export interface EsBuildPluginArgs {
  target?: Target;
  js?: boolean;
  jsx?: boolean;
  ts?: boolean;
  tsx?: boolean;
  jsxFactory?: string;
  jsxFragment?: string;
  loaders: Record<string, Loader>;
  define?: { [key: string]: string };
}

function logEsBuildMessages(filePath: string, code: string, messages: Message[], warning = false) {
  const relativePath = path.relative(process.cwd(), filePath);
  const color = chalk[warning ? 'yellow' : 'red'];

  for (const msg of messages) {
    console.error(
      `${warning ? 'Warning' : `Error`} while transforming ${relativePath}:\n ${color(msg.text)}`,
    );

    if (msg.location) {
      const location = { start: { line: msg.location.line, column: msg.location.column } };
      const result = codeFrameColumns(code, location, {
        highlightCode: true,
      });
      console.error(result);
    }
  }
}

function getEsBuildLoader(context: Context, args: EsBuildPluginArgs): Loader | null {
  if (context.response.is('js') && (args?.loaders?.js || args.js)) {
    return args?.loaders?.js ?? 'js';
  }
  if (context.path.endsWith('.ts') && (args?.loaders?.ts || args.ts)) {
    return args?.loaders?.ts ?? 'ts';
  }
  if (context.path.endsWith('.tsx') && (args?.loaders?.tsx || args.tsx)) {
    return args?.loaders?.tsx ?? 'tsx';
  }
  if (context.path.endsWith('.jsx') && (args?.loaders?.jsx || args.jsx)) {
    return args?.loaders?.jsx ?? 'jsx';
  }
  return null;
}

export function esbuildPlugin(args: EsBuildPluginArgs): Plugin {
  const handledExtensions = args.loaders ? Object.keys(args.loaders).map(e => `.${e}`) : [];
  if (args.ts) {
    handledExtensions.push('.ts');
  }
  if (args.jsx) {
    handledExtensions.push('.jsx');
  }
  if (args.tsx) {
    handledExtensions.push('.tsx');
  }

  let rootDir: string;
  let service: Service;

  return {
    async serverStart({ config }) {
      ({ rootDir } = config);
      service = await startService();

      ['exit', 'SIGINT'].forEach(event => {
        process.on(event, () => {
          service?.stop();
        });
      });
    },

    resolveMimeType(context) {
      if (handledExtensions.some(ext => context.path.endsWith(ext))) {
        return 'js';
      }
    },

    async transform(context) {
      const loader = getEsBuildLoader(context, args);

      if (loader) {
        const filePath = fileURLToPath(new URL(`.${context.path}`, `${pathToFileURL(rootDir)}/`));

        try {
          const { js, warnings } = await service.transform(context.body, {
            sourcefile: filePath,
            sourcemap: 'inline',
            target: args.target ?? 'esnext',
            jsxFactory: args.jsxFactory,
            jsxFragment: args.jsxFragment,
            loader,
          });
          if (warnings) {
            logEsBuildMessages(filePath, context.body, warnings, true);
          }

          return { body: js };
        } catch (e) {
          if (e.errors) {
            logEsBuildMessages(filePath, context.body, e.errors, true);
          }

          context.status = 500;
          return { body: '' };
        }
      }
    },
  };
}

export default esbuildPlugin;
