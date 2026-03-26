import fs from 'fs';
import path from 'path';
import { createFilter, type FilterPattern } from '@rollup/pluginutils';
// @ts-ignore - estree-walker has types but exports field blocks them
import { asyncWalk } from 'estree-walker';
import MagicString from 'magic-string';
import type { Node } from 'estree';
import type { Plugin } from 'rollup';
import {
  dynamicImportToGlob as dynamicURLToGlob,
  VariableDynamicImportError as VariableURLError,
} from '@rollup/plugin-dynamic-import-vars';

/**
 * Extract the relative path from an AST node representing this kind of expression `new URL('./path/to/asset.ext', import.meta.url)`.
 *
 * @param node - The AST node
 * @returns The relative path
 */
function getRelativeAssetPath(node: Node): string {
  // either normal string expression or else it would be Template Literal with a single quasi
  const browserPath =
    (node as any).arguments[0].value ?? (node as any).arguments[0].quasis[0].value.cooked;
  return browserPath.split('/').join(path.sep);
}

/**
 * Checks if a AST node represents this kind of expression: `new URL('./path/to/asset.ext', import.meta.url)`.
 *
 * @param node - The AST node
 * @returns undefined | 'static' | 'dynamic'
 */
function getImportMetaUrlType(node: Node): undefined | 'static' | 'dynamic' {
  const isNewURL =
    node.type === 'NewExpression' &&
    (node as any).callee.type === 'Identifier' &&
    (node as any).callee.name === 'URL' &&
    (node as any).arguments.length === 2 &&
    ((node as any).arguments[0].type === 'Literal' ||
      // Allow template literals, reuses @rollup/plugin-dynamic-import-vars logic
      (node as any).arguments[0].type === 'TemplateLiteral') &&
    typeof getRelativeAssetPath(node) === 'string' &&
    (node as any).arguments[1].type === 'MemberExpression' &&
    (node as any).arguments[1].object.type === 'MetaProperty' &&
    (node as any).arguments[1].property.type === 'Identifier' &&
    (node as any).arguments[1].property.name === 'url';

  if (!isNewURL) {
    return undefined;
  }

  if (
    (node as any).arguments[0].type === 'TemplateLiteral' &&
    (node as any).arguments[0].expressions.length > 0
  ) {
    return 'dynamic';
  }

  return 'static';
}

export interface ImportMetaAssetsOptions {
  /**
   * A picomatch pattern, or array of patterns, which specifies the files in the build the plugin should operate on. By default all files are targeted.
   */
  include?: FilterPattern;
  /**
   * A picomatch pattern, or array of patterns, which specifies the files in the build the plugin should _ignore_. By default no files are ignored.
   */
  exclude?: FilterPattern;
  /**
   * By default, the plugin quits the build process when it encounters an error. If you set this option to true, it will throw a warning instead and leave the code untouched.
   */
  warnOnError?: boolean;
  /**
   * A function to transform assets.
   */
  transform?: (
    assetContents: Buffer,
    absoluteAssetPath: string,
  ) => Promise<Buffer | null> | Buffer | null;
}

/**
 * Detects assets references relative to modules using patterns such as `new URL('./path/to/asset.ext', import.meta.url)`.
 * The assets are added to the rollup pipeline, allowing them to be transformed and hash the filenames.
 * Patterns that represent directories are skipped.
 *
 * @param options - Plugin options
 * @returns A Rollup Plugin
 */
function importMetaAssets(options: ImportMetaAssetsOptions = {}): Plugin {
  const { include, exclude, warnOnError, transform } = options;
  const filter = createFilter(include, exclude);

  return {
    name: 'rollup-plugin-import-meta-assets',
    async transform(code, id) {
      if (!filter(id)) {
        return null;
      }

      // Part 1: resolve dynamic template literal expressions
      const parsed = this.parse(code);

      let dynamicURLIndex = -1;
      let ms: MagicString | undefined;

      await asyncWalk(parsed, {
        enter: async (node: Node) => {
          const importMetaUrlType = getImportMetaUrlType(node);

          if (importMetaUrlType !== 'dynamic') {
            return;
          }
          dynamicURLIndex += 1;

          try {
            // see if this is a Template Literal with expressions inside, and generate a glob expression
            const glob = dynamicURLToGlob(
              (node as any).arguments[0],
              code.substring((node as any).start, (node as any).end),
            );

            if (!glob) {
              // this was not a variable dynamic url
              return;
            }

            const { globby } = await import('globby');
            // execute the glob
            const result = await globby(glob, { cwd: path.dirname(id) });
            const paths = result.map((r: string) =>
              r.startsWith('./') || r.startsWith('../') ? r : `./${r}`,
            );

            // create magic string if it wasn't created already
            ms = ms || new MagicString(code);
            // unpack variable dynamic url into a function with url statements per file, rollup
            // will turn these into chunks automatically
            ms.prepend(
              `function __variableDynamicURLRuntime${dynamicURLIndex}__(path) {
  switch (path) {
${paths.map((p: string) => `    case '${p}': return new URL('${p}', import.meta.url);`).join('\n')}
${`    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic new URL statement: " + path))
      );
    })\n`}   }
 }\n\n`,
            );
            // call the runtime function instead of doing a dynamic url, the url specifier will
            // be evaluated at runtime and the correct url will be returned by the injected function
            ms.overwrite(
              (node as any).start,
              (node as any).start + 7,
              `__variableDynamicURLRuntime${dynamicURLIndex}__`,
            );
          } catch (error) {
            if (error instanceof VariableURLError && warnOnError) {
              this.warn(error);
            } else {
              this.error(error as Error);
            }
          }
        },
      });

      let newCode = code;
      if (ms && dynamicURLIndex !== -1) {
        newCode = ms.toString();
      }

      // Part 2: emit asset files
      const ast = this.parse(newCode);
      const magicString = new MagicString(newCode);
      let modifiedCode = false;

      await asyncWalk(ast, {
        enter: async (node: Node) => {
          const importMetaUrlType = getImportMetaUrlType(node);
          if (!importMetaUrlType) {
            return;
          }

          if (importMetaUrlType === 'static') {
            const absoluteScriptDir = path.dirname(id);
            const relativeAssetPath = getRelativeAssetPath(node);
            const absoluteAssetPath = path.resolve(absoluteScriptDir, relativeAssetPath);
            const assetName = path.basename(absoluteAssetPath);

            try {
              const assetContents = await fs.promises.readFile(absoluteAssetPath);
              const transformedAssetContents =
                transform != null
                  ? await transform(assetContents, absoluteAssetPath)
                  : assetContents;
              if (transformedAssetContents === null) {
                return;
              }
              const ref = this.emitFile({
                type: 'asset',
                name: assetName,
                source: transformedAssetContents,
              });
              magicString.overwrite(
                (node as any).arguments[0].start,
                (node as any).arguments[1].end,
                `import.meta.ROLLUP_FILE_URL_${ref}`,
              );
              modifiedCode = true;
            } catch (error: any) {
              // Do not process directories, just skip
              if (error.code !== 'EISDIR') {
                if (warnOnError) {
                  this.warn(error, (node as any).arguments[0].start);
                } else {
                  this.error(error, (node as any).arguments[0].start);
                }
              }
            }
          }
        },
      });

      return {
        code: magicString.toString(),
        map: modifiedCode ? magicString.generateMap({ hires: true, includeContent: true }) : null,
      };
    },
  };
}

export { importMetaAssets };
